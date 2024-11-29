import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import NavigationWithProgress from '../components/NavigationWithProgress';
import colors from '../styles/colors';
import AdminNavigationWrapper from '../navigation/AdminNavigatorWrapper';

const { width } = Dimensions.get('window');

export default function AdminNavigator() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <>
      <AdminNavigationWrapper currentStep={currentStep}>
        <View style={styles.container}>
          <View style={styles.page}>
            {/* Burada ekran içeriği değişecektir */}
          </View>
        </View>
      </AdminNavigationWrapper>
      <NavigationWithProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
  },
});
