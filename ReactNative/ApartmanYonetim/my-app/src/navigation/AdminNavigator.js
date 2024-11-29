import React, { useState, useContext, useRef } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { RoleContext } from '../contexts/RoleProvider';
import NavigationWithProgress from '../components/NavigationWithProgress';
import AdminNavigationWrapper from '../navigation/AdminNavigatorWrapper';
import ApartmentInfoScreen from '../screens/admin/create/ApartmentInfoScreen';
import FinancialInfoScreen from '../screens/admin/create/FinancialInfoScreen';
import AuthorizationInfoScreen from '../screens/admin/create/AuthorizationInfoScreen';
import AdminInfoScreen from '../screens/admin/create/AdminInfoScreen';
import colors from '../styles/colors';

const { width } = Dimensions.get('window');

export default function AdminNavigator() {
  const { validationState, updateValidation } = useContext(RoleContext);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const adminInfoRef = useRef();
  const authorizationInfoRef = useRef();
  const apartmentInfoRef = useRef();
  const financialInfoRef = useRef();

  const validateStep = (step) => {
    let isValid = true;

    switch (step) {
      case 0:
        isValid = validateAdminInfo();
        break;
      case 1:
        isValid = validateAuthorizationInfo();
        break;
      case 2:
        isValid = validateApartmentInfo();
        break;
      case 3:
        isValid = validateFinancialInfo();
        break;
      default:
        break;
    }

    updateValidation(step, isValid);
    return isValid;
  };

  const validateAdminInfo = () => {
    return adminInfoRef.current.validate();
  };

  const validateAuthorizationInfo = () => {
    return authorizationInfoRef.current.validate();
  };

  const validateApartmentInfo = () => {
    return apartmentInfoRef.current.validate();
  };

  const validateFinancialInfo = () => {
    return financialInfoRef.current.validate();
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      Alert.alert('Hata', 'Lütfen geçerli bilgileri doldurun.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (<View>
    <AdminNavigationWrapper currentStep={currentStep}>
      <View style={styles.container}>
        {currentStep === 0 && <AdminInfoScreen ref={adminInfoRef} />}
        {currentStep === 1 && <AuthorizationInfoScreen ref={authorizationInfoRef} />}
        {currentStep === 2 && <ApartmentInfoScreen ref={apartmentInfoRef} />}
        {currentStep === 3 && <FinancialInfoScreen ref={financialInfoRef} />}
      </View>
    </AdminNavigationWrapper>
    <NavigationWithProgress
      currentStep={currentStep}
      totalSteps={totalSteps}
      validateStep={validateStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
    </View>
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
