// app/screens/HomeMenu.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Box {
  id: string;
  title: string;
  body: string;
}

const data: Box[] = [
  { id: '1', title: 'Box 1', body: 'Lorem ipsum dolor sit amet.', },
  { id: '2', title: 'Box 2', body: 'Consectetur adipiscing elit.', },
  { id: '3', title: 'Box 3', body: 'Sed do eiusmod tempor incididunt.', },
  { id: '4', title: 'Box 4', body: 'Ut labore et dolore magna aliqua.', },
  { id: '5', title: 'Box 5', body: 'Ut enim ad minim veniam.', },
];

const HomeMenu: React.FC = () => {
  const renderItem = ({ item }: { item: Box }) => (
    <View style={styles.box}>
      <View style={styles.boxContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
      </View>
      <MaterialIcons name="arrow-forward" size={24} color="black" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ccc',
    width: 300,
    height: 100,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  boxContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  body: {
    fontSize: 14,
  },
});

export default HomeMenu;
