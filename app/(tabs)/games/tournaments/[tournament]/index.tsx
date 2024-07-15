import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, FlatList, View, Text, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Button } from 'react-native';
import { Link, usePathname, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  Tournament, initTournamentDB, createTournamentTable, getTournament,
  Team, getTeams, Match, getMatches, Round,
} from '@/db/tournament';
import { useIsFocused } from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';


export default function SettingsScreen() {
  const isVisible = useIsFocused();
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const path = usePathname();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tournamentId = Number(path.replace("/games/tournaments/", ""));
  const width = Dimensions.get('window').width*0.8;
  const navigation = useNavigation();

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
      setTeams(await getTeams(db, tournamentId));
      let getTournamentMatches = await getMatches(db, tournamentId)
      if (getTournamentMatches.length === 0 && path.includes("/games/tournaments/") && isVisible) {
        onEdit()
      }

      setMatches(getTournamentMatches);
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
      newRounds.push({"id": i, "matches": round, "round": i})
    }
    setRounds(newRounds)
  }, [matches]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => onEdit()} >
          <MaterialIcons name="edit" size={24} color="#211071" />
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable onPress={() => handelCancel()} >
          <MaterialIcons name="chevron-left" size={32} color="#211071" />
        </Pressable>
      ),
    });
  }, [navigation]);

  function onLeaderboardPress() {
    router.replace("games/tournaments/" + tournamentId + "/leaderboard");
  }

  function onEdit() {
    router.replace("games/tournaments/" + tournamentId + "/edit");
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
    const nextIndex = Math.round(offsetX / width);
    if (nextIndex !== currentIndex) {
      // setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handelCancel = () => {
    router.replace("games");
  }

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
        {flex: 1, flexDirection: 'row', height: 30, flexGrow: 0, width: 30, alignItems: 'center'},
        item.round-1 === currentIndex && {backgroundColor: '#E5EDFF', borderWidth: 1, borderColor: '#211071' ,borderRadius: 3}
      ]}
      onPress={() =>onSetRound(item.round)}
    >
      <Text style={{flex: 1, textAlign: 'center', fontSize: 20}}>{item.round}</Text>
    </Pressable>
  );

  const renderRound = ({ item }: { item: Round }) => (
    <View style={{flex: 1, flexDirection: 'row'}}>
      {item.id != 1 &&
        <FlatList
          data={item.matches}
          style={{width: Dimensions.get('window').width*0.2, minHeight: Dimensions.get('window').width*1.5}}
          renderItem={renderMatchupLinks}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
        />
      }
      <FlatList
        data={item.matches}
        style={{width: Dimensions.get('window').width*0.6, minHeight: Dimensions.get('window').width*1.5}}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={{height: '82%'}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
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
          showsVerticalScrollIndicator={false}
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
              <MaterialIcons style={styles.nextPageText} name="arrow-back" size={30} color="black" />
            </Pressable>
              <View style={{width: rounds.length*30}}>
                <FlatList
                  data={rounds}
                  style={{width: rounds.length*30}}
                  showsHorizontalScrollIndicator={false}
                  horizontal
                  scrollEnabled={false}
                  renderItem={renderRoundNumbers}
                  keyExtractor={(item) => String(item.id)}
                />
              </View>
            <Pressable onPress={onSetForward}>
              <MaterialIcons style={styles.nextPageText} name="arrow-forward" size={22} color="black" />
            </Pressable>
          </View>
        </View>
        <View style={{padding: 5}}></View>
        <View style={styles.buttonInnerContainer}>
          <Pressable style={styles.primaryButton} onPress={onLeaderboardPress}>
            <Text style={styles.primaryText}>Leaderboard</Text>
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
  matchTitleLeft: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nextPageText: {
    paddingHorizontal: 10,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
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
  byeTitle: {
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    marginBottom: 5,
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
  buttonInnerContainerPageNumber: {
    flex: 1,
    textAlignVertical: 'center',
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  centerHorizontally: {
    flex: 1,
    alignItems: 'center',
  },
});
