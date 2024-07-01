import { Image, StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches, getMatch,
  deleteMatch, deleteMatches,
  updateMatch,
  updateTournament
} from '@/db/tournament';
import { useEffect, useState } from 'react';
import { useIsFocused } from "@react-navigation/native";
import { styles } from '@/styles/defaultStyles';


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
  console.log("tournamanent id: "+ tournamentId)
  console.log("match id: " + matchId)

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
    console.log("match: " + match)
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
            console.log("match complete: " + match.round)
          } 
        }
        tournament.progress = String(round)
        console.log("round complete: " + roundComplete)
      }
      // if (Number(tournament.progress) == totalRounds) {
      //   router.replace("games/tournaments/" + tournamentId + "/winner")
      // }
      await updateTournament(db, tournament)
      console.log("total rounds: " + totalRounds)
    }
  }

  const firstTeamWins = () => {
    console.log("first team wins")
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
    // router.push("games/tournaments/" + tournamentId);
  }

  const secondTeamWins = () => {
    console.log("second team wins")
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
    // router.push("games/tournaments/" + tournamentId);
  }

  const handleSubmit = () => {
    if (winner === firstTeam) {
      firstTeamWins()
    }
    else if (winner === secondTeam) {
      secondTeamWins()
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

  return (
    <View style={styles.gamesContainer}>
      <View style={{ maxHeight: '80%' }}>
        <View style={styles.gamesView}>
          <Text style={styles.inputHeader}>{firstTeam?.name} Cups:</Text>
          <View style={styles.inputView}>
            <TextInput
              placeholder='Enter Cups Shot'
              style={styles.input}
              value={firstTeamCups}
              onChangeText={handleFirstTeamCupsChange}
            />
          </View>
        </View>
        <View style={styles.gamesView}>
          <Text style={styles.inputHeader}>{secondTeam?.name} Cups:</Text>
          <View style={styles.inputView}>
            <TextInput
              placeholder='Enter Cups Shot'
              style={styles.input}
              value={secondTeamCups}
              onChangeText={handleSecondTeamCupsChange}
            />
          </View>
        </View>
        <View style={styles.gamesView}>
          <Text style={[styles.inputHeader, {paddingTop: 20}]}>Select Winner:</Text>
          <View style={styles.matchupView}>
            <View style={styles.matchupButtonView} onTouchEnd={() => {setWinner(firstTeam)}}>
              {winner === firstTeam && 
                <View style={[styles.matchButton, {backgroundColor: '#E5EDFF'}]}>
                  <Text style={styles.secondaryText}>{firstTeam?.name}</Text>
                </View>
              }
              {winner != firstTeam && 
                <View style={[styles.matchButton]}>
                  <Text style={styles.secondaryText}>{firstTeam?.name}</Text>
                </View>
              }
            </View>
            <View style={{width: '2%'}}></View>
            <View style={styles.matchupButtonView} onTouchEnd={() => {setWinner(secondTeam)}}>
              {winner === secondTeam && 
                <View style={[styles.matchButton, {backgroundColor: '#E5EDFF'}]}>
                  <Text style={styles.secondaryText}>{secondTeam?.name}</Text>
                </View>
              }
              {winner != secondTeam && 
                <View style={[styles.matchButton]}>
                  <Text style={styles.secondaryText}>{secondTeam?.name}</Text>
                </View>
              }
            </View>
          </View>
        </View>
        <View style={[styles.gamesView, {marginTop: 20}]}>
          <View style={styles.matchupView}>
            <Pressable style={styles.matchSingleButton} onPress={handleSubmit}>
              <Text style={styles.primaryText}>Set Winner</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.buttonStyleContainer}>
        <Pressable style={styles.secondaryButton} onPress={onLeaderboardPress}>
          <Text style={styles.secondaryText}>Leaderboard</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={onTournamentPress}>
          <Text style={styles.primaryText}>Tournament</Text>
        </Pressable>
      </View>
    </View>
  );
}
