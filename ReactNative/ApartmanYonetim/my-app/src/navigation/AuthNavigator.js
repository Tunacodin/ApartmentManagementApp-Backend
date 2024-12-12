import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EmailVerificationScreen from "../screens/EmailVerificationScreen";
import SMSVerificationScreen from "../screens/SMSVerificationScreen";

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SMSVerification"
        component={SMSVerificationScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
