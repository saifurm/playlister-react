import React from 'react';

export default class SongCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isDragging: false, draggedTo: false };
  }

  getItemNum = () => this.props.id.substring('song-card-'.length);

  handleDragStart = (e) => {
    e.dataTransfer.setData('song', e.currentTarget.id);
    this.setState({ isDragging: true });
  };
  handleDragOver = (e) => { e.preventDefault(); if (!this.state.draggedTo) this.setState({ draggedTo: true }); };
  handleDragEnter = (e) => { e.preventDefault(); if (!this.state.draggedTo) this.setState({ draggedTo: true }); };
  handleDragLeave = (e) => { e.preventDefault(); if (this.state.draggedTo) this.setState({ draggedTo: false }); };
  handleDrop = (e) => {
    e.preventDefault();
    let targetId = e.currentTarget.id;
    targetId = targetId.substring(targetId.lastIndexOf('-') + 1);
    let sourceId = e.dataTransfer.getData('song');
    sourceId = sourceId.substring(sourceId.lastIndexOf('-') + 1);
    this.setState({ isDragging: false, draggedTo: false });
    if (this.props.moveCallback) this.props.moveCallback(sourceId, targetId);
  };

  handleDoubleClick = () => { if (this.props.editCallback) this.props.editCallback(this.getItemNum()); };
  handleRemove = (e) => { e.stopPropagation(); if (this.props.removeCallback) this.props.removeCallback(this.getItemNum()); };
  handleDuplicate = (e) => { e.stopPropagation(); if (this.props.duplicateCallback) this.props.duplicateCallback(this.getItemNum()); };

  render() {
    const { song } = this.props;
    const num = this.getItemNum();

    const classes = [
      'song-card',
      this.props.isSelected ? 'selected-song-card' : 'unselected-song-card',
      this.state.draggedTo ? 'song-card-dragged-to' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        id={this.props.id}
        className={classes}
        draggable
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onDoubleClick={this.handleDoubleClick}
        title="Double-click to edit"
      >
        <span className="song-card-num">{num}.</span>
        <a
          className="song-card-title"
          href={song.youTubeId ? `https://www.youtube.com/watch?v=${song.youTubeId}` : undefined}
          target="_blank"
          rel="noreferrer"
        >
          {song.title}
        </a>
        <span className="song-card-year">{song.year ? ` (${song.year})` : ''}</span>
        <span className="song-card-by"> by </span>
        <span className="song-card-artist">{song.artist}</span>

        <input
          id={`duplicate-song-button-${num}`}
          type="button"
          className="song-card-button"
          value="⧉"
          onClick={this.handleDuplicate}
          title="Duplicate song"
        />
        <input
          id={`remove-song-button-${num}`}
          type="button"
          className="song-card-button"
          value="🗑"
          onClick={this.handleRemove}
          title="Remove song"
        />
      </div>
    );
  }
}
