import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, PermissionsAndroid, Alert } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

interface SMSMessage {
  address: string;
  body: string;
  date: string;
}

const SMSReader: React.FC = () => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);

  useEffect(() => {
    requestSMSPermission();
  }, []);

  const requestSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS messages to process transactions.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        fetchSMSMessages();
      } else {
        Alert.alert('Permission Denied', 'Cannot read SMS without permission');
      }
    } catch (err) {
      console.warn(err);
    }
  };
 
  const fetchSMSMessages = () => {
    const filter = {
      box: 'inbox',
      read: 0,
      indexFrom: 0,
      maxCount: 10,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.error('Failed to fetch messages:', fail);
      },

      (count, smsList) => {
        const fetchedMessages: SMSMessage[] = JSON.parse(smsList);
        let regex = new RegExp("[a-zA-Z0-9]{2}-[a-zA-Z0-9]{6}", "i");
        const filteredMessages = fetchedMessages.filter((message) =>
          regex.test(message.address)
        );
        setMessages(filteredMessages);
      },
    );
  };

  const renderMessage = ({ item }: { item: SMSMessage }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>From: {item.address}</Text>
      <Text style={styles.body}>{item.body}</Text>
      <Text style={styles.date}>Date: {new Date(Number(item.date)).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Received SMS Messages</Text>
      {messages.length > 0 ? (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
        />
      ) : (
        <Text style={styles.noMessages}>No messages found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    elevation: 2,
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  body: {
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#6c757d',
  },
  noMessages: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6c757d',
  },
});

export default SMSReader;
