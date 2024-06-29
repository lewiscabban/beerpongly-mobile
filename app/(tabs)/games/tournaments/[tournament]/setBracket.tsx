import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Text, Pressable, ScrollView } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams,
  Match, createMatchTable, insertMatch, getMatches, updateMatches,
  deleteMatch, deleteMatches,
  getTotalRounds,
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";
import { styles } from '@/styles/defaultStyles';

interface Matchup {
  id: number
  firstTeam: Team
  secondTeam: Team
}

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
    for (let i = 0; i < teams.length-1; i+=2) {
      if (i+1 < teams.length) {
        const firstTeam = teams[i];
        const secondTeam = teams[i+1];
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
    console.log("deleted matches: " + matches)

    // Calculating the total number of rounds
    
    console.log("rounds count: " + totalRounds)
    matches = []

    // Create initial matches
    for (let i = totalRounds; i >= 0; i--) {
      for (let j = 0; j < Math.pow(2, i) - 1; j+=2) {
        console.log("teams in round: " + Math.pow(2,i))
        console.log("creating match")
        let firstTeam: number | null = null;
        let secondTeam: number | null = null;
        if (i == totalRounds) {
          if (teams[j]) {firstTeam = teams[j].id; console.log(firstTeam)}
          if (teams[j+1]) {secondTeam = teams[j+1].id; console.log(secondTeam)}
        }
        let result: Match | null = await insertMatch(db, totalRounds - i + 1, firstTeam, secondTeam, 0, 0, null, null, null, null, tournamentId);
        console.log(result?.firstTeam)
        if (result) {
          matches.push(result);
        }
      }
    }
    // return
    console.log("organising matches: " + matches)
    let lastRound = 1;
    let roundCount = 0;
    let previousRoundCount = 0;
    for (let currentRound = 1; currentRound <= totalRounds; currentRound++) {
      previousRoundCount = roundCount;
      roundCount = 0;
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        console.log("round: " + currentRound + " match: " + match.id + " rc: " + roundCount + " match.round: " + match.round)
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


    matches = await getMatches(db, tournamentId);
    for (let i = 0; i < matches.length; i++) {
      console.log("t1: " + matches[i].firstTeam + " t2: " + matches[i].secondTeam + " match round: " + matches[i].round + " i: " + i + " id: " + matches[i].id + " nextmatch: " + matches[i].nextMatch + " 1: " + matches[i].firstPreviousMatchId + " 2: " + matches[i].secondPreviousMatchId)
    }
    router.push("games/tournaments/" + tournamentId);
  }

  const handleRandomise = () => {
    async function updateTeamPositions() {
      const db = await initTournamentDB();
      await updateTeams(db, teams);
    }
  
    let randomTeams = [...teams];
    shuffle(randomTeams)
    setTeams(randomTeams)
    updateTeamPositions()
  }

  const renderItem = ({ item }: { item: Team }) => (
    <View style={styles.box}>
      <View style={styles.boxContent}>
        <Text style={styles.title}>position: {item.position} Name: {item.name}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={24} color="black" />
    </View>
  );

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
      {/* <MaterialIcons name="arrow-forward" size={24} color="black" /> */}
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
        <Pressable style={styles.secondaryButton} onPress={handleRandomise}>
          <Text style={styles.secondaryText}>Randomise</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={createMatches}>
          <Text style={styles.primaryText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
