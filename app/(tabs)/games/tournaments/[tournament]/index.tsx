import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, FlatList, View, Text, ScrollView, Dimensions } from 'react-native';
import { Link, usePathname, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Tournament, initTournamentDB, createTournamentTable, insertTournament, getTournament,
  Team, createTeamTable, insertTeam, getTeams, updateTeams, getTeam,
  Match, createMatchTable, insertMatch, getMatches, updateMatches,
  deleteMatch, deleteMatches, Round,
  Matchup
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";
import { styles } from '@/styles/defaultStyles';


export default function SettingsScreen() {
  const isVisible = useIsFocused();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const path = usePathname();
  const [firstTeam, setfFrstTeam] = useState<Team|null>(null);
  const [secondTeam, setSecondTeam] = useState<Team|null>(null);
  const tournamentId = Number(path.replace("/games/tournaments/", ""));

  console.log("tournamanent id: "+ path.replace("/games/tournaments/", ""))
  function getTeamName(id: number): string {
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.id == id) {
        return team.name
      }
    }
    return ""
  }

  useEffect(() => {
    async function createTables() {
      const db = await initTournamentDB();
      await createTournamentTable(db);
      setTournament(await getTournament(db, tournamentId));
      setTeams(await getTeams(db, tournamentId));
      setMatches(await getMatches(db, tournamentId));
    }

    createTables();
  }, [isVisible]);
  useEffect(() => {
    let totalRounds = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].round > totalRounds) {totalRounds = matches[i].round}
    }
    let newRounds: Round[] = []
    for (let i = 1; i <= totalRounds; i++) {
      let round: Match[] = []
      for (let j = 0; j < matches.length; j++) {
        const element = matches[j];
        if (element.round == i) {
          round.push(element)
        }
      }
      newRounds.push({"id": i, "matches": round})
      console.log(round)
    }
    setRounds(newRounds)
  }, [matches]);

  function onLeaderboardPress() {
    router.replace("games/tournaments/" + tournamentId + "/leaderboard");
  }

  function onSetBracketPress() {
    router.replace("games/tournaments/" + tournamentId + "/setBracket");
  }

  function onPlayMatch(item: Match) {
    router.replace("games/tournaments/" + tournamentId + "/match/" + item.id);
  }

  const renderItem = ({ item }: { item: Match }) => (
    <Pressable style={{flex: 1, flexDirection: 'row', width: '100%'}} onPress={() => onPlayMatch(item)}>
      <View style={[styles.box, item.round != 1 && {marginVertical: ((item.round-1)*(item.round)*60)-((item.round-2)*120)-50}]} >
        <View style={[styles.matchBoxContent, item.firstTeam != null && item.firstTeam === item.winner && {backgroundColor: '#E5EDFF', borderTopRightRadius: 8, borderTopLeftRadius: 8}]}>
          {
            getTeamName(item.firstTeam) == "" && item.round === 1
            ? 
            <Text style={[styles.matchTitleLeft, {fontWeight: 500, color: '#979797'}]}>BYE</Text>
            :
            <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
              <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-start'}}>
                <Text style={styles.matchTitle}>{getTeamName(item.firstTeam)}</Text>
              </View>
              {
                item.winner === null ?
                <></> :
                <View>
                  {/* {
                    getTeamName(item.secondTeam) === "" && item.round === 1 ?
                    <></> :
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <Text style={styles.matchTitleLeft}>{item.firstTeamCups}</Text>
                    </View>
                  } */}
                  {
                    item.firstTeam != null && item.firstTeam === item.winner ?
                    <MaterialIcons style={styles.matchTitleLeft} name="check" size={22} color="black" /> :
                    <MaterialIcons style={styles.matchTitleLeft} name="close" size={22} color="black" />
                  }
                </View>
              }
            </View>
          }
        </View>
        <View style={styles.matchBr}></View>
        <View style={[styles.matchBoxContent, item.secondTeam != null && item.secondTeam === item.winner && {backgroundColor: '#E5EDFF', borderBottomRightRadius: 8, borderBottomLeftRadius: 8}]}>
          {
            getTeamName(item.secondTeam) === "" && item.round === 1
            ? 
            <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797', textAlignVertical: 'center'}]}>BYE</Text>
            :
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'column', alignItems: 'flex-start'}}>
                <Text style={styles.matchTitle}>{getTeamName(item.secondTeam)}</Text>
              </View>
              {
                item.winner === null ?
                <></> :
                <View>
                {/* {
                  getTeamName(item.secondTeam) === "" && item.round === 1 ?
                  <></> :
                  <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                    <Text style={styles.matchTitleLeft}>{item.firstTeamCups}</Text>
                  </View>
                } */}
                  {
                    item.secondTeam != null && item.secondTeam === item.winner ?
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <MaterialIcons style={styles.matchTitleLeft} name="check" size={22} color="black" />
                    </View>
                    :
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <MaterialIcons style={styles.matchTitleLeft} name="close" size={22} color="black" />
                    </View>
                  }
                </View>
              }
            </View>
          }
        </View>
      </View>
    </Pressable>
  );

  const renderMatchupLinks = ({ item }: { item: Match }) => (
    <View style={[styles.matchLinkBox, item.round != 0 && {height: ((item.round-1)*(item.round)*60)-((item.round-2)*120), marginVertical: ((item.round-1)*(item.round)*30)-((item.round-2)*60)}]}>
      <View style={styles.matchLinkBoxContent1}>
      </View>
      <View style={styles.matchLinkBoxContent2}>
        <View style={[styles.matchBr, {paddingTop: ((item.round-1)*(item.round)*30)-((item.round-2)*60)}]}></View>
      </View>
    </View>
  );

  const renderRound = ({ item }: { item: Round }) => (
    <View style={{flex: 1, flexDirection: 'row'}}>
      {item.id != 1 &&
        <FlatList
          data={item.matches}
          style={{width: Dimensions.get('window').width*0.2, }}
          renderItem={renderMatchupLinks}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      }
      <FlatList
        data={item.matches}
        style={{width: Dimensions.get('window').width*0.6}}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={{height: '89%'}}>
        <FlatList
        data={rounds}
        horizontal
        renderItem={renderRound}
        keyExtractor={(item) => String(item.id)}
      />
      </ScrollView>
      
      <View style={styles.buttonStyleContainer}>
        <Pressable style={styles.secondaryButton} onPress={onSetBracketPress}>
          <Text style={styles.secondaryText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={onLeaderboardPress}>
          <Text style={styles.primaryText}>Leaderboard</Text>
        </Pressable>
      </View>
    </View>
  );
}
