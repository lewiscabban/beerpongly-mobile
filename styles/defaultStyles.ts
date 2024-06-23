import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
    },
    inputContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 8,
      marginLeft: 8,
      marginTop: 5,
      width: 200,
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
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 0,
      marginHorizontal: 10,
      borderRadius: 8,
      elevation: 3,
      backgroundColor: '#211071',
      height: 50,
      width: '48%'
    },
    primaryText: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 0,
      marginHorizontal: 10,
      borderRadius: 8,
      elevation: 3,
      backgroundColor: 'white',
      height: 50,
      width: '48%'
    },
    secondaryText: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: '#211071',
    },
    buttonStyleContainer: {
      // flex: 1,
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 15,
      marginTop: 5,
     },
  });
  