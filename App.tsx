/*  --- Group 3 -- simple shopping app--
        -- wireless assignment--
      1 Abdulaziz Yimam 16,001/23
      2 Eyuel Alemayehu 15,036/23
      3 Mahemud Abderezak  15,772/22
      4 Bereket Wondater 16,000/23
      5 Eyerus Bogale 15,033/23

*/

import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Appbar,
  TextInput,
  Button,
  Card,
  List,
  Checkbox,
  Modal,
  Portal,
  Text,
  Snackbar,
  SegmentedButtons,
} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconPicker from './IconPicker';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#6200ee', accent: '#03dac4' },
};

const Item = ({ item, onToggle, onDelete, onEdit }) => (
  <Card style={styles.card}>
    <List.Item
      title={item.name}
      titleStyle={item.purchased ? styles.itemTextPurchased : {}}
      description={`Qty: ${item.quantity} | Category: ${
        item.category || 'N/A'
      }`}
      left={() => (
        <View style={styles.itemLeftContainer}>
          <Icon
            name={item.icon || 'cart-outline'}
            size={28}
            color="#666"
            style={{ marginRight: 10 }}
          />
          <Checkbox
            status={item.purchased ? 'checked' : 'unchecked'}
            onPress={() => onToggle(item.id, item.purchased)}
          />
        </View>
      )}
      right={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button icon="pencil" compact onPress={() => onEdit(item)} />
          <Button
            icon="delete"
            compact
            onPress={() => onDelete(item.id, item)}
          />
        </View>
      )}
    />
  </Card>
);

function MainApp() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('');

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editItemIcon, setEditItemIcon] = useState('');

  const [lastDeletedItem, setLastDeletedItem] = useState(null);
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const itemsCollection = firestore().collection('items');

  useEffect(() => {
    return itemsCollection.orderBy('name').onSnapshot(querySnapshot => {
      const itemsList = [];
      querySnapshot.forEach(doc => {
        itemsList.push({ id: doc.id, ...doc.data() });
      });
      setItems(itemsList);
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'active') return items.filter(item => !item.purchased);
    if (filter === 'done') return items.filter(item => item.purchased);
    return items;
  }, [items, filter]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      acc[category].sort((a, b) => a.purchased - b.purchased);
      return Object.assign(acc, { [category]: acc[category] });
    }, {});
  }, [filteredItems]);

  const activeCount = useMemo(
    () => items.filter(item => !item.purchased).length,
    [items],
  );
  const doneCount = useMemo(
    () => items.filter(item => item.purchased).length,
    [items],
  );

  const addItem = async () => {
    if (newItemName.trim() === '' || newItemQty.trim() === '') return;
    await itemsCollection.add({
      name: newItemName,
      quantity: parseInt(newItemQty, 10),
      category: newItemCategory.trim() || 'Uncategorized',
      icon: newItemIcon,
      purchased: false,
    });
    setNewItemName('');
    setNewItemQty('');
    setNewItemCategory('');
    setNewItemIcon('');
  };

  const toggleItemPurchased = (id, status) => {
    itemsCollection.doc(id).update({ purchased: !status });
  };

  const deleteItem = (id, itemData) => {
    setLastDeletedItem({ id, ...itemData });
    itemsCollection.doc(id).delete();
    setSnackbarVisible(true);
  };

  const handleUndoDelete = () => {
    if (!lastDeletedItem) return;
    const { id, ...itemData } = lastDeletedItem;
    itemsCollection.doc(id).set(itemData);
  };

  const handleEditPress = item => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQty(item.quantity.toString());
    setEditCategory(item.category || '');
    setEditItemIcon(item.icon || '');
    setEditModalVisible(true);
  };

  const handleSaveChanges = () => {
    if (!editingItem) return;
    const updatedItem = {
      ...editingItem,
      name: editName,
      quantity: parseInt(editQty, 10),
      category: editCategory.trim() || 'Uncategorized',
      icon: editItemIcon,
    };
    setItems(current =>
      current.map(item => (item.id === editingItem.id ? updatedItem : item)),
    );
    setEditModalVisible(false);
    itemsCollection
      .doc(editingItem.id)
      .update({
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        category: updatedItem.category,
        icon: updatedItem.icon,
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content
          title="Shopping List"
          subtitle={`${activeCount} items remaining`}
        />
      </Appbar.Header>

      <Portal>
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 20 }}>
            Edit Item
          </Text>
          <IconPicker
            selectedIcon={editItemIcon}
            onSelectIcon={setEditItemIcon}
          />
          <TextInput
            label="Item Name"
            value={editName}
            onChangeText={setEditName}
            mode="outlined"
          />
          <TextInput
            label="Quantity"
            value={editQty}
            onChangeText={setEditQty}
            keyboardType="numeric"
            mode="outlined"
          />
          <TextInput
            label="Category"
            value={editCategory}
            onChangeText={setEditCategory}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleSaveChanges}
            style={{ marginTop: 10 }}
          >
            Save Changes
          </Button>
        </Modal>
      </Portal>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>
              Add New Item
            </Text>
            <IconPicker
              selectedIcon={newItemIcon}
              onSelectIcon={setNewItemIcon}
            />
            <TextInput
              label="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
              mode="outlined"
            />
            <TextInput
              label="Quantity"
              value={newItemQty}
              onChangeText={setNewItemQty}
              keyboardType="numeric"
              mode="outlined"
            />
            <TextInput
              label="Category"
              value={newItemCategory}
              onChangeText={setNewItemCategory}
              mode="outlined"
            />
            <Button
              icon="plus-circle"
              mode="contained"
              onPress={addItem}
              style={{ marginTop: 10 }}
            >
              Add Item
            </Button>
          </Card.Content>
        </Card>

        <SegmentedButtons
          style={styles.filterButtons}
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: `All (${items.length})` },
            { value: 'active', label: `Active (${activeCount})` },
            { value: 'done', label: `Done (${doneCount})` },
          ]}
        />

        {Object.keys(groupedItems).length > 0 ? (
          Object.keys(groupedItems).map(category => (
            <List.Section key={category}>
              <List.Subheader>{category}</List.Subheader>
              {groupedItems[category].map(item => (
                <Item
                  key={item.id}
                  item={item}
                  onToggle={toggleItemPurchased}
                  onDelete={deleteItem}
                  onEdit={handleEditPress}
                />
              ))}
            </List.Section>
          ))
        ) : (
          <Text style={styles.emptyListText}>
            No items to show for this filter.
          </Text>
        )}
      </ScrollView>

      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{ label: 'Undo', onPress: handleUndoDelete }}
        duration={5000}
      >
        Item deleted.
      </Snackbar>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <MainApp />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  content: { paddingHorizontal: 8 },
  card: { marginVertical: 8 },
  itemTextPurchased: { textDecorationLine: 'line-through', color: '#999' },
  modal: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 8 },
  filterButtons: { paddingHorizontal: 10, paddingVertical: 10 },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  itemLeftContainer: { flexDirection: 'row', alignItems: 'center' },
});
