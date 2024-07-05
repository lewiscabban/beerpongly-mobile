import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, FlatList, View, Text, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
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
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tournamentId = Number(path.replace("/games/tournaments/", ""));
  const width = Dimensions.get('window').width*0.8;
  const [lastOffsetX, setLastOffsetX] = useState(0);

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

  function onSetBack() {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  }

  function onSetForward() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < rounds.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }

  function onSetRound(index: number) {
    const nextIndex = index - 1;
    if (nextIndex < rounds.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }

  function getIndex(): number {
    return (currentIndex >= rounds.length -1 ? currentIndex - 1 : currentIndex)
  }

  function getHiddenLink(item: Match): any {
    return (item.round <= currentIndex+1 && item.round != rounds.length ? {borderColor: '#F8FAFC', borderWidth: 0} : {})
  }

  function getHiddenMatchup(item: Match): any {
    return (item.round <= currentIndex && item.round != rounds.length-1 ? {borderColor: '#F8FAFC', borderWidth: 0, color: '#F8FAFC', backgroundColor: '#F8FAFC'} : {})
  }

  const updateindex = (offsetX: number) => {
    setLastOffsetX(offsetX);
    const nextIndex = Math.round(offsetX / width);

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    updateindex(offsetX)
  };

  const handleMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setLastOffsetX(offsetX);
    const nextIndex = Math.round(offsetX / width);
    console.log("offset: " + offsetX)
    if (nextIndex !== currentIndex) {
      // setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: Match }) => (
    <Pressable style={{flex: 1, flexDirection: 'row', width: '100%'}} onPress={() => onPlayMatch(item)}>
      <View style={[styles.box, (item.round - (getIndex())) > 1 && {marginVertical: (((item.round - (getIndex()))-1)*((item.round - (getIndex())))*60)-(((item.round - (getIndex()))-2)*120)-50}, getHiddenMatchup(item)]} >
        <View style={[styles.matchBoxContent, item.firstTeam != null && item.firstTeam === item.winner && {backgroundColor: '#E5EDFF', borderTopRightRadius: 8, borderTopLeftRadius: 8}, getHiddenMatchup(item)]}>
          {
            getTeamName(item.firstTeam) == "" && (item.round) === 1
            ? 
            <Text style={[styles.matchTitleLeft, {fontWeight: 500, color: '#979797'}, getHiddenMatchup(item)]}>BYE</Text>
            :
            <View style={{flex: 1, flexDirection: 'row', width: '100%'}}>
              <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-start'}}>
                <Text style={[styles.matchTitle, getHiddenMatchup(item)]}>{getTeamName(item.firstTeam)}</Text>
              </View>
              {
                item.winner === null ?
                <></> :
                <View>
                  {/* {
                    getTeamName(item.secondTeam) === "" && (item.round - (getIndex())) === 1 ?
                    <></> :
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <Text style={[styles.matchTitleLeft, getHiddenMatchup(item)]}>{item.firstTeamCups}</Text>
                    </View>
                  } */}
                  {
                    item.firstTeam != null && item.firstTeam === item.winner ?
                    <MaterialIcons style={[styles.matchTitleLeft, getHiddenMatchup(item)]} name="check" size={22} color="black" /> :
                    <MaterialIcons style={[styles.matchTitleLeft, getHiddenMatchup(item)]} name="close" size={22} color="black" />
                  }
                </View>
              }
            </View>
          }
        </View>
        <View style={[styles.matchBr, getHiddenMatchup(item)]}></View>
        <View style={[styles.matchBoxContent, item.secondTeam !== null && item.secondTeam === item.winner && {backgroundColor: '#E5EDFF', borderBottomRightRadius: 8, borderBottomLeftRadius: 8}, getHiddenMatchup(item)]}>
          {
            getTeamName(item.secondTeam) === "" && (item.round) === 1
            ? 
            <Text style={[styles.matchTitle, {fontWeight: 500, color: '#979797', textAlignVertical: 'center'}, getHiddenMatchup(item)]}>BYE</Text>
            :
            <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex: 1, flexDirection: 'column', alignItems: 'flex-start'}}>
                <Text style={[styles.matchTitle, getHiddenMatchup(item)]}>{getTeamName(item.secondTeam)}</Text>
              </View>
              {
                item.winner === null ?
                <></> :
                <View>
                {/* {
                  getTeamName(item.secondTeam) === "" && (item.round - (getIndex())) === 1 ?
                  <></> :
                  <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                    <Text style={[styles.matchTitleLeft, getHiddenMatchup(item)]}>{item.firstTeamCups}</Text>
                  </View>
                } */}
                  {
                    item.secondTeam != null && item.secondTeam === item.winner ?
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <MaterialIcons style={[styles.matchTitleLeft, getHiddenMatchup(item)]} name="check" size={22} color="black" />
                    </View>
                    :
                    <View style={{flex: 1, flexDirection: 'column', width: '100%', alignItems: 'flex-end'}}>
                      <MaterialIcons style={[styles.matchTitleLeft, getHiddenMatchup(item)]} name="close" size={22} color="black" />
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
    <View style={[styles.matchLinkBox, (item.round - (getIndex())) != 0 && {height: (((item.round - (getIndex()))-1)*((item.round - (getIndex())))*60)-(((item.round - (getIndex()))-2)*120), marginVertical: (((item.round - (getIndex()))-1)*((item.round - (getIndex())))*30)-(((item.round - (getIndex()))-2)*60)}]}>
      <View style={[styles.matchLinkBoxContent1, getHiddenLink(item)]}>
      </View>
      <View style={styles.matchLinkBoxContent2}>
        <View style={[styles.matchBr, {paddingTop: (((item.round - (getIndex()))-1)*((item.round - (getIndex())))*30)-(((item.round - (getIndex()))-2)*60)}, , getHiddenLink(item)]}></View>
      </View>
    </View>
  );

  const renderRoundNumbers = ({ item }: { item: Round }) => (
    <Pressable
      style={[
        {flex: 1, flexDirection: 'row', height: 20, flexGrow: 0, width: 20, alignItems: 'center'},
        item.matches[0].round-1 === currentIndex && {backgroundColor: '#E5EDFF', borderWidth: 1, borderColor: '#211071' ,borderRadius: 3}
      ]}
      onPress={() =>onSetRound(item.matches[0]?.round)}
    >
      <Text style={{flex: 1, textAlign: 'center'}}>{item.matches[0]?.round}</Text>
    </Pressable>
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
      <ScrollView style={{height: '80%'}}>
        <FlatList
        data={rounds}
        ref={flatListRef}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={width}
        getItemLayout={(data, index) => (
          { length: width, offset: width * index, index }
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
        renderItem={renderRound}
        keyExtractor={(item) => String(item.id)}
      />
      </ScrollView>
      <View style={styles.buttonStyleContainer}>
        <View style={[styles.centerHorizontally]}>
          <View style={styles.buttonInnerContainerPageNumber}>
            <Pressable onPress={onSetBack}>
              <MaterialIcons style={styles.matchTitleLeft} name="arrow-back" size={22} color="black" />
            </Pressable>
              <View style={{width: rounds.length*20}}>
                <FlatList
                  data={rounds}
                  style={{width: rounds.length*20}}
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  scrollEnabled={false}
                  renderItem={renderRoundNumbers}
                  keyExtractor={(item) => String(item.id)}
                />
              </View>
            <Pressable onPress={onSetForward}>
              <MaterialIcons style={styles.matchTitleLeft} name="arrow-forward" size={22} color="black" />
            </Pressable>
          </View>
        </View>
        <View style={styles.buttonInnerContainer}>
          <Pressable style={styles.secondaryButton} onPress={onSetBracketPress}>
            <Text style={styles.secondaryText}>Edit</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={onLeaderboardPress}>
            <Text style={styles.primaryText}>Leaderboard</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
