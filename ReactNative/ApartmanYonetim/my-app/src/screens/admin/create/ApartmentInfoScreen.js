import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import { MaterialIcons } from "react-native-vector-icons";
import LottieView from "lottie-react-native";
import colors from "../../../styles/colors";
import animate from "../../../assets/json/animApartment.json";

const ApartmentInfoScreen = forwardRef((props, ref) => {
  const [apartmentName, setApartmentName] = useState("");
  const [address, setAddress] = useState("");
  const [numberOfFlats, setNumberOfFlats] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [apartments, setApartments] = useState([]);

  useImperativeHandle(ref, () => ({
    validate() {
      if (!apartmentName.trim() || !address.trim()) {
        alert("Apartman adı ve adres boş bırakılamaz!");
        return false;
      }
      if (!numberOfFlats.trim() || isNaN(numberOfFlats)) {
        alert("Daire sayısı geçerli bir sayı olmalıdır!");
        return false;
      }
      if (!managerPhone.trim() || managerPhone.length < 10) {
        alert("Yönetici telefon numarası geçerli bir numara olmalıdır!");
        return false;
      }
      return true;
    },
  }));

  const handleSave = () => {
    if (
      !apartmentName.trim() ||
      !address.trim() ||
      !numberOfFlats ||
      !managerPhone.trim()
    ) {
      Alert.alert("Hata", "Tüm alanları doldurmalısınız!");
      return;
    }

    const newApartment = {
      id: Math.random().toString(),
      name: apartmentName,
      address,
      numberOfFlats,
      managerPhone,
    };

    setApartments((prev) => [...prev, newApartment]);
    clearInputs();
  };

  const clearInputs = () => {
    setApartmentName("");
    setAddress("");
    setNumberOfFlats("");
    setManagerPhone("");
  };

  const handleDelete = (id) => {
    setApartments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setApartmentName(item.name);
    setAddress(item.address);
    setNumberOfFlats(item.numberOfFlats);
    setManagerPhone(item.managerPhone);

    handleDelete(item.id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.apartmentItem}>
      <Text style={styles.apartmentText}>{item.name}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* FlatList */}
      <FlatList
        data={apartments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View>
            {/* Animasyon */}
            <LottieView
              source={animate}
              autoPlay
              loop
              style={styles.animation}
            />

            {/* Başlık */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Apartman Bilgileri</Text>
            </View>

            {/* Apartman Adı Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="apartment"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Apartman Adı"
                placeholder="Apartman adını girin"
                value={apartmentName}
                onChangeText={setApartmentName}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            {/* Adres Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="location-on"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Adres"
                placeholder="Apartman adresini girin"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            {/* Daire Sayısı Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="format-list-numbered"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Daire Sayısı"
                placeholder="Daire sayısını girin"
                value={numberOfFlats}
                onChangeText={setNumberOfFlats}
                keyboardType="number-pad"
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            {/* Yönetici Telefon Numarası Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="phone"
                size={24}
                color={colors.primary}
                style={styles.icon}
              />
              <PaperInput
                mode="outlined"
                label="Yönetici Telefon"
                placeholder="Yönetici telefon numarasını girin"
                value={managerPhone}
                onChangeText={setManagerPhone}
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor={colors.darkGray}
                activeOutlineColor={colors.primary}
              />
            </View>

            {/* Kaydet Butonu */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>

            {/* Apartmanlar Listesi Başlığı */}
            <Text style={styles.listTitle}>Apartmanlar</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  animation: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 90,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginBottom: 10,
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
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  apartmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 5,
    marginBottom: 10,
  },
  apartmentText: {
    fontSize: 16,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  listContent: {
    padding: 20,
  },
});

export default ApartmentInfoScreen;
