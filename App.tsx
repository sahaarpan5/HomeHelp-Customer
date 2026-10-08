
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import Navigation from './android/src/screen/Navigator/Navigation';



function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      
        <Navigation />
    </NavigationContainer>
    
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
