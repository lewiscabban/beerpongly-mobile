import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Text, Pressable, ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable,
  getTournament, Team, getTeams, updateTeams,
  Match, createMatchTable, insertMatch, getMatches,
  updateMatches, deleteMatches,
  getTotalRounds, Matchup, updateTournament,
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";

export default function SetBracket() {
  const isVisible = useIsFocused();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [nextMatchups, setNextMatchups] = useState<Matchup[]>([]);
  const path = usePathname();
  const tournamentId = Number(path.replace("/games/tournaments/", "").replace("/setBracket", ""));

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      setTournament(await getTournament(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
    }

    createTables();
  }, [isVisible]);

  useEffect(() => {
    let newMatchups: Matchup[] = [];
    let count = 0;
    let organisedTeams = [...teams]
    organisedTeams.sort((n1,n2) => {
      if (n1.position < n2.position) {
          return 1;
      }
  
      if (n1.position > n2.position) {
          return -1;
      }
  
      return 0;
    })
    for (let i = 0; i < organisedTeams.length-1; i+=2) {
      if (i+1 < organisedTeams.length) {
        const firstTeam = organisedTeams[i];
        const secondTeam = organisedTeams[i+1];
        newMatchups.push({
          id: count,
          firstTeam: firstTeam,
          secondTeam: secondTeam,
        });
        count++;
      }
    }
    setMatchups(newMatchups);
  }, [teams]);

  useEffect(() => {
    let newNextMatchups: Matchup[] = []
    for (let i = 0; i < matchups.length/2; i++) {
      newNextMatchups.push(matchups[i]);
    }
    setNextMatchups(newNextMatchups);
  }, [matchups]);

  function shuffle(array: Team[]) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    for (let i = 0; i < array.length; i++) {
      array[i].position = i+1;
    }
  }

  const createMatches = async () => {
    let totalRounds = getTotalRounds(teams);
    const db = await initTournamentDB();
    await createMatchTable(db);
    let matches = await getMatches(db, tournamentId)
    if (matches.length > 0) {
      await deleteMatches(db, matches)
    }
    matches = []

    // Create initial matches
    for (let i = totalRounds; i >= 0; i--) {
      for (let j = 0; j < Math.pow(2, i) - 1; j+=2) {
        let firstTeam: number | null = null;
        let secondTeam: number | null = null;
        if (i == totalRounds) {
          if (teams[j]) {firstTeam = teams[j].id}
          if (teams[j+1]) {secondTeam = teams[j+1].id}
        }
        let result: Match | null = await insertMatch(db, totalRounds - i + 1, firstTeam, secondTeam, 0, 0, null, null, null, null, tournamentId);
        if (result) {
          matches.push(result);
        }
      }
    }

    // return
    let lastRound = 1;
    let roundCount = 0;
    let previousRoundCount = 0;
    for (let currentRound = 1; currentRound <= totalRounds; currentRound++) {
      previousRoundCount = roundCount;
      roundCount = 0;
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.round == currentRound) {
          if (currentRound > 1) {
            matches[i].firstPreviousMatchId = matches[i - previousRoundCount + roundCount].id
            matches[i].secondPreviousMatchId = matches[i - previousRoundCount + roundCount + 1].id

            matches[i - previousRoundCount + roundCount].nextMatch = matches[i].id
            matches[i - previousRoundCount + roundCount + 1].nextMatch = matches[i].id
          }
          roundCount++;
        }
      }
      lastRound = currentRound;
    }
    for (let i = 0; i < matches.length; i++) {
      await updateMatches(db, matches)
    }
    if (tournament) {
      await updateTournament(db, {...tournament, progress: "1"})
    }
    
    router.replace("games/tournaments/" + tournamentId);
  }

  const handelCancel = () => {
    router.replace("games/tournaments/" + tournamentId);
  }

  const handleRandomise = () => {
    async function updateTeamPositions(randomTeams: Team[]) {
      const db = await initTournamentDB();
      await updateTeams(db, randomTeams);
    }
  
    let randomTeams = [...teams];
    shuffle(randomTeams)
    setTeams(randomTeams)
    updateTeamPositions(randomTeams)
  }

  const renderMatchups = ({ item }: { item: Matchup }) => (
    <View style={styles.matchBox}>
      <View style={styles.matchBoxContent}>
        {item.firstTeam.name == "" && 
          <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797'}]}>BYE</Text>
        }
        <Text style={styles.matchTitle}>{item.firstTeam.name}</Text>
      </View>
      <View style={styles.matchBr}></View>
      <View style={styles.matchBoxContent}>

        {item.secondTeam.name == "" && 
          <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797'}]}>BYE</Text>
        }
        <Text style={styles.matchTitle}>{item.secondTeam.name}</Text>
      </View>
    </View>
  );

  const renderMatchupLinks = ({ item }: { item: Matchup }) => (
    <View style={styles.matchLinkBox}>
      <View style={styles.matchLinkBoxContent1}>
      </View>
      <View style={styles.matchLinkBoxContent2}>
        <View style={[styles.matchBr, {paddingTop: 60}]}></View>
      </View>
    </View>
  );

  const renderNextMatchups = ({ item }: { item: Matchup }) => (
    <View style={[styles.matchNextBox]}>
      <View style={styles.matchBoxContent}>
      </View>
      <View style={styles.matchBr}></View>
      <View style={styles.matchBoxContent}>
      </View>
    </View>
  );

  return (
    <View style={styles.matchContainer}>
      <ScrollView style={{height: '89%'}}>
        <View style={styles.matchScroll}>
          <FlatList
            scrollEnabled={false}
            style={{height: '100%', width: '60%'}}
            data={matchups}
            renderItem={renderMatchups}
            keyExtractor={(item) => String(item.id)}
          />
          <FlatList
            scrollEnabled={false}
            style={{height: '100%', width: '20%'}}
            data={nextMatchups}
            renderItem={renderMatchupLinks}
            keyExtractor={(item) => String(item.id)}
          />
          <FlatList
            scrollEnabled={false}
            style={{height: '100%', width: '20%'}}
            data={nextMatchups}
            renderItem={renderNextMatchups}
            keyExtractor={(item) => String(item.id)}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonStyleContainer}>
        <View style={styles.buttonInnerContainer}>
          {tournament?.progress && 
            <Pressable style={styles.cancelButton} onPress={handelCancel}>
              <MaterialIcons name="arrow-back" size={24} color="#211071" />
            </Pressable>
          }
          <Pressable style={styles.secondaryButton} onPress={handleRandomise}>
            <Text style={styles.secondaryText}>Randomise</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={createMatches}>
            <Text style={styles.primaryText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    paddingLeft: 10,
    height: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  box: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#211071',
  },
  boxContent: {
    flex: 1,
    flexDirection: 'row',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    paddingLeft: 10,
    height: '80%',
  },
  matchScroll: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    height: '80%',
  },
  matchBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    verticalAlign: 'middle',
    width: '100%',
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#211071',
  },
  matchLinkBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    verticalAlign: 'middle',
    width: '100%',
    height: 120,
    marginVertical: 60,
  },
  matchNextBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    verticalAlign: 'middle',
    width: '100%',
    height: 120,
    marginTop: 60,
    marginBottom: 60,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
    borderWidth: 1,
    borderColor: '#211071',
  },
  matchBoxContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  matchLinkBoxContent1: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderColor: '#211071',
  },
  matchLinkBoxContent2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderColor: '#211071',
  },
  matchBr: {
    borderBottomWidth: 1,
    borderColor: '#211071',
    alignSelf: 'stretch',
    height: 1,
    width: '100%',
  },
  matchTitle: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
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
  leaderboardContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    paddingLeft: 10,
    height: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 7.5,
    marginRight: 7.5,
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
    paddingBottom: 15,
    paddingTop: 15,
    backgroundColor: '#F8FAFC',
  },
  buttonInnerContainer: {
    flex: 1,
    textAlignVertical: 'center',
    flexDirection: 'row',
    paddingBottom: 5,
    paddingTop: 5,
    backgroundColor: '#F8FAFC',
  },
  gamesView: {
    left: 0,
    right: 0,
    height: 80,
    width: '100%',
    paddingBottom: 8,
    paddingTop: 8,
  },
  gamesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
});
