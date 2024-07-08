import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  initTournamentDB, getTournament,
  Team, createTeamTable, getTeams, getTeam,
  Match, createMatchTable, getMatches, getMatch,
  updateMatch, updateTournament
} from '@/db/tournament';
import { useEffect, useState } from 'react';
import { useIsFocused } from "@react-navigation/native";


export default function SettingsScreen() {
  const isVisible = useIsFocused();
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").split("/")[0]);
  const matchId = Number(path.replace("/games/tournaments/", "").split("/")[2]);
  const [match, setMatch] = useState<Match|null>(null);
  const [winner, setWinner] = useState<Team|null>(null);
  const [firstTeam, setFirstTeam] = useState<Team|null>(null);
  const [secondTeam, setSecondTeam] = useState<Team|null>(null);
  const [firstTeamCups, setFrstTeamCups] = useState<string>("");
  const [secondTeamCups, setSecondTeamCups] = useState<string>("");
  const [errorFirstTeamCups, setErrorFirstTeamCups] = useState<Boolean>(false);
  const [errorSecondTeamCups, setErrorSecondTeamCups] = useState<Boolean>(false);
  const [errorSelectTeam, setErrorSelectTeam] = useState<Boolean>(false);
  const [errorFirstTeamCupsText, setErrorFirstTeamCupsText] = useState<string>("");
  const [errorSecondTeamCupsText, setErrorSecondTeamCupsText] = useState<string>("");
  const [errorSelectTeamText, setErrorSelectTeamText] = useState<string>("");

  useEffect(() => {
    if (match?.winner) {
      if (firstTeam?.id == match.winner) {
        setWinner(firstTeam)
      }
      if (secondTeam?.id == match.winner) {
        setWinner(secondTeam)
      }
    }
  }, [firstTeam || secondTeam])

  useEffect(() => {
    if (match?.firstTeamCups) {
      setFrstTeamCups(String(match.firstTeamCups))
    }
    if (match?.secondTeamCups) {
      setSecondTeamCups(String(match.secondTeamCups))
    }
  }, [match])

  useEffect(() => {
    async function initTeams() {
      const db = await initTournamentDB();
      await createTeamTable(db);
      if (match) {
        setFirstTeam(await getTeam(db, match.firstTeam));
        setSecondTeam(await getTeam(db, match.secondTeam));
      }
    }

    initTeams();
  }, [match])

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createMatchTable(db);
      setMatch(await getMatch(db, matchId));
    }

    createTables();
  }, [isVisible]);

  async function updateProgress() {
    const db = await initTournamentDB();
    let tournament = await getTournament(db, tournamentId)
    let matches = await getMatches(db, tournamentId);
    let teams = await getTeams(db, tournamentId)
    let totalRounds = 0;
    if (tournament) {
      let currentTeams = teams.length;
      while (currentTeams > 1) {
        currentTeams /= 2;
        totalRounds++;
      }
      for (let round = 1; round <= totalRounds; round++) {
        let roundComplete = true;
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          if (match.round == round) {
            if (match.winner) {
              
            } else {
              roundComplete = false;
            }
          } 
        }
        tournament.progress = String(round)
      }
      await updateTournament(db, tournament)
    }
  }

  const firstTeamWins = () => {
    async function updateFinishedMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      await updateMatch(db, updatedMatch);
    }

    async function findNextMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      let nextMatch = await getMatch(db, updatedMatch.nextMatch);
      if (nextMatch) {
        if (nextMatch.firstPreviousMatchId == updatedMatch.id) {
          nextMatch.firstTeam = updatedMatch.firstTeam;
        } else if (nextMatch.secondPreviousMatchId == updatedMatch.id) {
          nextMatch.secondTeam = updatedMatch.firstTeam;
        }
        await updateMatch(db, nextMatch);
      }
      
    }

    if (match) {
      let updatedMatch = match
      updatedMatch.winner = match.firstTeam
      updatedMatch.firstTeamCups = Number(firstTeamCups)
      updatedMatch.secondTeamCups = Number(secondTeamCups)

      updateFinishedMatch(updatedMatch)
      findNextMatch(updatedMatch)
      updateProgress()
    }
    router.replace("games/tournaments/" + tournamentId)
  }

  const secondTeamWins = () => {
    async function updateFinishedMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      await updateMatch(db, updatedMatch);
    }

    async function findNextMatch(updatedMatch: Match ) {
      const db = await initTournamentDB();
      let nextMatch = await getMatch(db, updatedMatch.nextMatch);
      if (nextMatch) {
        if (nextMatch.firstPreviousMatchId == updatedMatch.id) {
          nextMatch.firstTeam = updatedMatch.secondTeam;
        } else if (nextMatch.secondPreviousMatchId == updatedMatch.id) {
          nextMatch.secondTeam = updatedMatch.secondTeam;
        }
        await updateMatch(db, nextMatch);
      }
      
    }

    if (match) {
      let updatedMatch = match
      updatedMatch.winner = match.secondTeam
      updatedMatch.firstTeamCups = Number(firstTeamCups)
      updatedMatch.secondTeamCups = Number(secondTeamCups)

      updateFinishedMatch(updatedMatch)
      findNextMatch(updatedMatch)
    }
    router.replace("games/tournaments/" + tournamentId)
  }

  const handleSubmit = () => {
    let currentErrorFirstTeamCups: Boolean = false
    let currentErrorSecondTeamCups: Boolean = false
    if (firstTeamCups === "") {
      setErrorFirstTeamCups(true)
      currentErrorFirstTeamCups = true
      setErrorFirstTeamCupsText("Please enter number of cups shot.")
    }
    else if (firstTeamCups.match(/^[0-9]+$/) == null) {
      setErrorFirstTeamCups(true)
      currentErrorFirstTeamCups = true
      setErrorFirstTeamCupsText("Input must be a number.")
    }
    else {
      setErrorFirstTeamCups(false)
      setErrorFirstTeamCupsText("")
    }

    if (secondTeamCups === "") {
      setErrorSecondTeamCups(true)
      currentErrorSecondTeamCups = true
      setErrorSecondTeamCupsText("Please enter number of cups shot.")
    }
    else if (secondTeamCups.match(/^[0-9]+$/) == null) {
      setErrorSecondTeamCups(true)
      currentErrorSecondTeamCups = true
      setErrorSecondTeamCupsText("Input must be a number.")
    }
    else {
      setErrorSecondTeamCups(false)
      setErrorSecondTeamCupsText("")
    }

    if (currentErrorFirstTeamCups || currentErrorSecondTeamCups) {
      if (winner === null) {
        setErrorSelectTeam(true)
        setErrorSelectTeamText("Please select a winner.")
      }
      else {
        setErrorSelectTeam(false)
        setErrorSelectTeamText("")
      }
    }
    else if (winner === firstTeam) {
      if (Number(firstTeamCups) <= Number(secondTeamCups)) {
        setErrorSelectTeam(true)
        setErrorSelectTeamText("The winner must shoot more cups.")
      }
      else {
        firstTeamWins()
      }
    }
    else if (winner === secondTeam) {
      if (Number(secondTeamCups) <= Number(firstTeamCups)) {
        setErrorSelectTeam(true)
        setErrorSelectTeamText("The winner must shoot more cups.")
      }
      else {
        secondTeamWins()
      }
    }
    else {
      setErrorSelectTeam(true)
      setErrorSelectTeamText("Please select a winner.")
    }
  };

  const handleFirstTeamCupsChange = (text: string) => {
    setFrstTeamCups(text);
  };

  const handleSecondTeamCupsChange = (text: string) => {
    setSecondTeamCups(text);
  };

  function onTournamentPress() {
    router.replace("games/tournaments/" + tournamentId);
  }

  function onLeaderboardPress() {
    router.replace("games/tournaments/" + tournamentId + "/leaderboard");
  }

  const handelCancel = () => {
    router.replace("games/tournaments/" + tournamentId);
  }

  return (
    <View style={styles.gamesContainer}>
      <View style={{ maxHeight: '80%' }}>
        <View style={styles.gamesView}>
          <Text style={styles.inputHeader}>{firstTeam?.name} Cups:</Text>
          <View style={styles.inputView}>
            <TextInput
              placeholder='Enter Cups Shot'
              style={errorFirstTeamCups ? styles.inputError : styles.input}
              value={firstTeamCups}
              onChangeText={handleFirstTeamCupsChange}
            />
          </View>
        </View>
        <Text style={styles.errorText}>{errorFirstTeamCupsText}</Text>
        <View style={styles.gamesView}>
          <Text style={styles.inputHeader}>{secondTeam?.name} Cups:</Text>
          <View style={styles.inputView}>
            <TextInput
              placeholder='Enter Cups Shot'
              style={errorSecondTeamCups ? styles.inputError : styles.input}
              value={secondTeamCups}
              onChangeText={handleSecondTeamCupsChange}
            />
          </View>
        </View>
        <Text style={styles.errorText}>{errorSecondTeamCupsText}</Text>
        <View style={[styles.gamesView, {height: 90}]}>
          <Text style={[styles.inputHeader]}>Select Winner:</Text>
          <View style={styles.matchupView}>
            <View style={errorSelectTeam ? styles.matchupButtonViewError : styles.matchupButtonView} onTouchEnd={() => {setWinner(firstTeam)}}>
              {winner === firstTeam ?
                <View style={[styles.matchButton, {backgroundColor: '#E5EDFF'}]}>
                  <Text style={styles.secondaryText}>{firstTeam?.name}</Text>
                </View>
                :
                <View style={[styles.matchButton]}>
                  <Text style={styles.secondaryText}>{firstTeam?.name}</Text>
                </View>
              }
            </View>
            <View style={{width: '2%'}}></View>
            <View style={errorSelectTeam ? styles.matchupButtonViewError : styles.matchupButtonView} onTouchEnd={() => {setWinner(secondTeam)}}>
              {winner === secondTeam ? 
                <View style={[styles.matchButton, {backgroundColor: '#E5EDFF'}]}>
                  <Text style={styles.secondaryText}>{secondTeam?.name}</Text>
                </View>
                :
                <View style={[styles.matchButton]}>
                  <Text style={styles.secondaryText}>{secondTeam?.name}</Text>
                </View>
              }
            </View>
          </View>
        </View>
        <Text style={styles.errorText}>{errorSelectTeamText}</Text>
        <View style={[styles.gamesView]}>
          <View style={styles.matchupView}>
            <Pressable style={styles.matchSingleButton} onPress={handleSubmit}>
              <Text style={styles.primaryText}>Set Winner</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.buttonStyleContainer}>
        <View style={styles.buttonInnerContainer}>
          <Pressable style={styles.cancelButton} onPress={handelCancel}>
            <MaterialIcons name="arrow-back" size={24} color="#211071" />
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onLeaderboardPress}>
            <Text style={styles.secondaryText}>Leaderboard</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={onTournamentPress}>
            <Text style={styles.primaryText}>Tournament</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  matchupView: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,
  },
  matchButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    elevation: 3,
    backgroundColor: 'white',
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 9,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    height: 40,
  },
  inputError: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 9,
    borderRadius: 8,
    borderColor: 'red',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    height: 40,
  },
  inputHeader: {
    alignItems: "center",
    paddingLeft: 25,
    paddingBottom: 5,
    fontWeight: 'bold',
    color: '#211071',
  },
  errorText: {
    alignItems: "center",
    paddingLeft: 25,
    fontWeight: 'bold',
    color: 'red',
  },
  matchSingleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#211071',
    height: 50,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 7.5,
    marginRight: 15,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: '#211071',
    height: 50,
  },
  primaryText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 15,
    marginRight: 7.5,
    borderRadius: 8,
    elevation: 3,
    backgroundColor: 'white',
    height: 50,
  },
  secondaryText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: '#211071',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 7.5,
    marginRight: 7.5,
    borderRadius: 8,
    elevation: 3,
    maxWidth: 50,
    backgroundColor: '#F8FAFC',
    height: 50,
  },
  buttonStyleContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    // paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 15,
    backgroundColor: '#F8FAFC',
  },
  buttonInnerContainer: {
    flex: 1,
    textAlignVertical: 'center',
    flexDirection: 'row',
    // paddingHorizontal: 20,
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: '#F8FAFC',
  },
  gamesContainer: {
    height: '100%'
  },
  inputView: {
    height: 40,
    width: '100%',
  },
  matchupButtonView: {
    height: 40,
    width: '49%',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
  },
  matchupButtonViewError: {
    height: 40,
    width: '49%',
    borderRadius: 8,
    // backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: '#fef2f2',
  },
  gamesView: {
    width: '100%',
    paddingBottom: 8,
    paddingTop: 8,
  },
});
