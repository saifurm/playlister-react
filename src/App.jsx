// src/App.jsx
import React from 'react';
import './App.css';

import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';

import DeleteListModal from './components/DeleteListModal.jsx';
import EditSongModal from './components/EditSongModal.jsx';

import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.tps = new jsTPS();
    this.db = new DBManager();

    const loadedSessionData = this.db.queryGetSessionData();

    this.state = {
      listKeyPairMarkedForDeletion: null,
      currentList: null,
      sessionData: loadedSessionData,
      songIndexBeingEdited: null,
    };
  }

  sortKeyNamePairsByName = (keyNamePairs) => {
    keyNamePairs.sort((a, b) => a.name.localeCompare(b.name));
  };

  createNewList = () => {
    const newKey = this.state.sessionData.nextKey;
    const newName = 'Untitled' + newKey;

    const newList = { key: newKey, name: newName, songs: [] };
    const newKeyNamePair = { key: newKey, name: newName };
    const updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: prev.listKeyPairMarkedForDeletion,
        currentList: newList,
        sessionData: {
          nextKey: prev.sessionData.nextKey + 1,
          counter: prev.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
      }),
      () => {
        this.db.mutationCreateList(newList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  duplicateList = (key) => {
    const original = this.db.queryGetList(key);
    if (!original) return;

    const newKey = this.state.sessionData.nextKey;
    const newName = original.name + ' Copy';
    const newList = {
      key: newKey,
      name: newName,
      songs: JSON.parse(JSON.stringify(original.songs)),
    };

    const newKeyNamePair = { key: newKey, name: newName };
    const updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: prev.listKeyPairMarkedForDeletion,
        currentList: prev.currentList,
        sessionData: {
          nextKey: prev.sessionData.nextKey + 1,
          counter: prev.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
      }),
      () => {
        this.db.mutationCreateList(newList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  deleteList = (key) => {
    let newCurrentList = null;
    if (this.state.currentList && this.state.currentList.key !== key) {
      newCurrentList = this.state.currentList;
    }

    const idx = this.state.sessionData.keyNamePairs.findIndex((p) => p.key === key);
    const newPairs = [...this.state.sessionData.keyNamePairs];
    if (idx >= 0) newPairs.splice(idx, 1);

    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        sessionData: {
          nextKey: prev.sessionData.nextKey,
          counter: prev.sessionData.counter - 1,
          keyNamePairs: newPairs,
        },
      }),
      () => {
        this.db.mutationDeleteList(key);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  deleteMarkedList = () => {
    this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
    this.hideDeleteListModal();
  };

  deleteCurrentList = () => {
    if (this.state.currentList) this.deleteList(this.state.currentList.key);
  };

  renameList = (key, newName) => {
    const pairs = [...this.state.sessionData.keyNamePairs];
    pairs.forEach((p) => {
      if (p.key === key) p.name = newName;
    });
    this.sortKeyNamePairsByName(pairs);

    const currentList = this.state.currentList;
    if (currentList && currentList.key === key) currentList.name = newName;

    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: null,
        sessionData: {
          nextKey: prev.sessionData.nextKey,
          counter: prev.sessionData.counter,
          keyNamePairs: pairs,
        },
      }),
      () => {
        const list = this.db.queryGetList(key);
        list.name = newName;
        this.db.mutationUpdateList(list);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  loadList = (key) => {
    const newCurrentList = this.db.queryGetList(key);
    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: prev.listKeyPairMarkedForDeletion,
        currentList: newCurrentList,
        sessionData: this.state.sessionData,
      }),
      () => this.tps.clearAllTransactions()
    );
  };

  closeCurrentList = () => {
    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: prev.listKeyPairMarkedForDeletion,
        currentList: null,
        sessionData: this.state.sessionData,
      }),
      () => this.tps.clearAllTransactions()
    );
  };

  setStateWithUpdatedList(list) {
    this.setState(
      (prev) => ({
        listKeyPairMarkedForDeletion: prev.listKeyPairMarkedForDeletion,
        currentList: list,
        sessionData: this.state.sessionData,
      }),
      () => this.db.mutationUpdateList(this.state.currentList)
    );
  }

  getPlaylistSize = () => (this.state.currentList ? this.state.currentList.songs.length : 0);

  moveSong(start, end) {
    const list = this.state.currentList;
    start -= 1;
    end -= 1;

    if (start < end) {
      const tmp = list.songs[start];
      for (let i = start; i < end; i++) list.songs[i] = list.songs[i + 1];
      list.songs[end] = tmp;
    } else if (start > end) {
      const tmp = list.songs[start];
      for (let i = start; i > end; i--) list.songs[i] = list.songs[i - 1];
      list.songs[end] = tmp;
    }
    this.setStateWithUpdatedList(list);
  }

  addMoveSongTransaction = (start, end) => {
    const t = new MoveSong_Transaction(this, start, end);
    this.tps.processTransaction(t);
  };

  undo = () => {
    if (this.tps.hasTransactionToUndo()) {
      this.tps.undoTransaction();
      this.db.mutationUpdateList(this.state.currentList);
    }
  };

  redo = () => {
    if (this.tps.hasTransactionToDo()) {
      this.tps.doTransaction();
      this.db.mutationUpdateList(this.state.currentList);
    }
  };

  markListForDeletion = (keyPair) => {
    this.setState(
      (prev) => ({
        currentList: prev.currentList,
        listKeyPairMarkedForDeletion: keyPair,
        sessionData: prev.sessionData,
      }),
      () => this.showDeleteListModal()
    );
  };

  showDeleteListModal() {
    const modal = document.getElementById('delete-list-modal');
    if (modal) modal.classList.add('is-visible');
  }
  hideDeleteListModal() {
    const modal = document.getElementById('delete-list-modal');
    if (modal) modal.classList.remove('is-visible');
  }

  showEditSongModal = (oneBasedIndex) => {
    this.setState({ songIndexBeingEdited: oneBasedIndex }, () => {
      const m = document.getElementById('edit-song-modal');
      if (m) m.classList.add('is-visible');
    });
  };

  hideEditSongModal = () => {
    const m = document.getElementById('edit-song-modal');
    if (m) m.classList.remove('is-visible');
    this.setState({ songIndexBeingEdited: null });
  };

  confirmEditSong = ({ title, artist, year, youTubeId }) => {
    const list = this.state.currentList;
    if (!list || this.state.songIndexBeingEdited == null) return;
    const idx = this.state.songIndexBeingEdited - 1;
    list.songs[idx] = { ...list.songs[idx], title, artist, year, youTubeId };
    this.setStateWithUpdatedList(list);
    this.hideEditSongModal();
  };

  removeSong = (oneBasedIndex) => {
    const list = this.state.currentList;
    if (!list) return;
    const idx = Number(oneBasedIndex) - 1;
    if (idx < 0 || idx >= list.songs.length) return;
    list.songs.splice(idx, 1);
    this.setStateWithUpdatedList(list);
  };

  duplicateSong = (oneBasedIndex) => {
    const list = this.state.currentList;
    if (!list) return;
    const idx = Number(oneBasedIndex) - 1;
    if (idx < 0 || idx >= list.songs.length) return;
    const copy = JSON.parse(JSON.stringify(list.songs[idx]));
    list.songs.splice(idx + 1, 0, copy);
    this.setStateWithUpdatedList(list);
  };

  addSong = () => {
    const list = this.state.currentList;
    if (!list) return;
    const newSong = { title: 'Untitled', artist: '???', year: '', youTubeId: '' };
    list.songs.push(newSong);
    this.setStateWithUpdatedList(list);
  };

  render() {
    const canAddSong = this.state.currentList !== null;
    const canUndo = this.tps.hasTransactionToUndo();
    const canRedo = this.tps.hasTransactionToDo();
    const canClose = this.state.currentList !== null;

    const songForModal =
      this.state.currentList && this.state.songIndexBeingEdited
        ? this.state.currentList.songs[this.state.songIndexBeingEdited - 1]
        : null;

    return (
      <div id="root">
        <Banner />
        <SidebarHeading createNewListCallback={this.createNewList} />
        <SidebarList
          currentList={this.state.currentList}
          keyNamePairs={this.state.sessionData.keyNamePairs}
          deleteListCallback={this.markListForDeletion}
          loadListCallback={this.loadList}
          renameListCallback={this.renameList}
          duplicateListCallback={this.duplicateList}
        />
        <EditToolbar
          canAddSong={canAddSong}
          canUndo={canUndo}
          canRedo={canRedo}
          canClose={canClose}
          addSongCallback={this.addSong}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
        />
        <SongCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          editSongCallback={this.showEditSongModal}
          removeSongCallback={this.removeSong}
          duplicateSongCallback={this.duplicateSong}
        />
        <Statusbar currentList={this.state.currentList} />
        <DeleteListModal
          listKeyPair={this.state.listKeyPairMarkedForDeletion}
          hideDeleteListModalCallback={this.hideDeleteListModal}
          deleteListCallback={this.deleteMarkedList}
        />
        <EditSongModal
          id="edit-song-modal"
          song={songForModal}
          isVisible={this.state.songIndexBeingEdited != null}
          onConfirm={this.confirmEditSong}
          onCancel={this.hideEditSongModal}
        />
      </div>
    );
  }
}

export default App;
