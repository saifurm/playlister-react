import React from "react";

export default class EditToolbar extends React.Component {
  render() {
    const {
      canAddSong,
      canUndo,
      canRedo,
      canClose,
      addSongCallback,
      undoCallback,
      redoCallback,
      closeCallback,
    } = this.props;

    const addSongClass = "toolbar-button" + (canAddSong ? "" : " disabled");
    const undoClass = "toolbar-button" + (canUndo ? "" : " disabled");
    const redoClass = "toolbar-button" + (canRedo ? "" : " disabled");
    const closeClass = "toolbar-button" + (canClose ? "" : " disabled");

    return (
      <div id="edit-toolbar">
        <input
          type="button"
          id="add-song-button"
          value="+"
          className={addSongClass}
          disabled={!canAddSong}
          onClick={addSongCallback}
          title="Add new song"
        />
        <input
          type="button"
          id="undo-button"
          value="⟲"
          className={undoClass}
          disabled={!canUndo}
          onClick={undoCallback}
          title="Undo"
        />
        <input
          type="button"
          id="redo-button"
          value="⟳"
          className={redoClass}
          disabled={!canRedo}
          onClick={redoCallback}
          title="Redo"
        />
        <input
          type="button"
          id="close-button"
          value="✕"
          className={closeClass}
          disabled={!canClose}
          onClick={closeCallback}
          title="Close list"
        />
      </div>
    );
  }
}
