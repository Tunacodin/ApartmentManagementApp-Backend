import React, { useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';

const WorkerJobInfoScreen = ({ navigation }) => {
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İş Bilgileri</Text>
      <TextInput style={styles.input} placeholder="Pozisyon" value={position} onChangeText={setPosition} />
      <TextInput style={styles.input} placeholder="Departman" value={department} onChangeText={setDepartment} />
      <Button title="İlerle" onPress={() => navigation.navigate('VerificationScreen')} />
    </View>
  );
};

export default WorkerJobInfoScreen;
