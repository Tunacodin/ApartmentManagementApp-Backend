import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import LottieView from "lottie-react-native"; // LottieView import edildi
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animFinance.json"; // Animasyon dosyası import edildi

const FinancialInfoScreen = forwardRef((props, ref) => {
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useImperativeHandle(ref, () => ({
    validate() {
      if (!iban.trim() || iban.length < 16 || iban.length > 34) {
        alert("IBAN numarası geçerli bir uzunlukta olmalıdır!");
        return false;
      }
      if (!bankName.trim()) {
        alert("Banka adı boş bırakılamaz!");
        return false;
      }
      if (!accountHolder.trim()) {
        alert("Hesap sahibinin adı boş bırakılamaz!");
        return false;
      }
      return true;
    },
  }));

  return (
    <View style={styles.container}>
      {/* Animasyon */}
      <LottieView source={animate} autoPlay loop style={styles.animation} />

      {/* Başlık */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Yönetici Finansal Bilgileri</Text>
      </View>

      {/* IBAN Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="account-balance"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="IBAN"
          placeholder="IBAN numaranızı girin"
          value={iban}
          onChangeText={setIban}
          keyboardType="default"
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      {/* Banka Adı Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="account-balance-wallet"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Banka Adı"
          placeholder="Banka adını girin"
          value={bankName}
          onChangeText={setBankName}
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      {/* Hesap Sahibi Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="person"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Hesap Sahibi"
          placeholder="Hesap sahibinin adını girin"
          value={accountHolder}
          onChangeText={setAccountHolder}
          style={styles.input}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>

      {/* Ek Notlar Input */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="note"
          size={24}
          color={colors.primary}
          style={styles.icon}
        />
        <PaperInput
          mode="outlined"
          label="Ek Notlar"
          placeholder="Ek bilgi veya notlar girin (isteğe bağlı)"
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
          multiline
          style={[styles.input, { height: 80 }]}
          outlineColor={colors.darkGray}
          activeOutlineColor={colors.primary}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 20,
  
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.black,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
});

export default FinancialInfoScreen;
