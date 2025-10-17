// src/components/EditSongModal.jsx
import React from "react";

export default function EditSongModal({
  id = "edit-song-modal",
  song,
  isVisible,
  onConfirm,
  onCancel,
}) {
  if (!song) return <div className="modal" id={id} data-animation="slideInOutLeft" />;

  const handleSubmit = (e) => {
    e.preventDefault();
    // If any input fails native validation (like Year), stop submit
    if (!e.currentTarget.reportValidity()) return;

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: (fd.get("title") || "").toString().trim(),
      artist: (fd.get("artist") || "").toString().trim(),
      year: (fd.get("year") || "").toString().trim(),
      youTubeId: (fd.get("youTubeId") || "").toString().trim(),
    };

    onConfirm && onConfirm(payload);
  };

  return (
    <div
      className={`modal ${isVisible ? "is-visible" : ""}`}
      id={id}
      data-animation="slideInOutLeft"
    >
      <div
        className="modal-root"
        id="edit-song-modal-root"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Green header bar – matches HW1 */}
        <div className="modal-north">Edit Song</div>

        {/* Center grid (labels left, inputs right). 4 rows for 4 fields. */}
        <form
          id="edit-song-form"
          className="modal-center"
          onSubmit={handleSubmit}
          style={{ gridTemplateColumns: "30% 65%", gridTemplateRows: "repeat(4, auto)", rowGap: "10px", columnGap: "20px" }}
          autoComplete="off"
          noValidate
        >
          {/* Title */}
          <div className="modal-prompt"><span>Title:</span></div>
          <input
            name="title"
            className="modal-textfield"
            defaultValue={song.title ?? ""}
            required
            autoFocus
          />

          {/* Artist */}
          <div className="modal-prompt"><span>Artist:</span></div>
          <input
            name="artist"
            className="modal-textfield"
            defaultValue={song.artist ?? ""}
            required
          />

          {/* Year – exact 4 digits */}
          <div className="modal-prompt"><span>Year:</span></div>
          <input
            name="year"
            className="modal-textfield"
            defaultValue={song.year ?? ""}
            pattern="[0-9]{4}"
            inputMode="numeric"
            title="Enter a 4-digit year (e.g., 1994)"
            required
          />

          {/* YouTube Id */}
          <div className="modal-prompt"><span>You Tube Id:</span></div>
          <input
            name="youTubeId"
            className="modal-textfield"
            defaultValue={song.youTubeId ?? ""}
            required
          />
        </form>

        {/* Grey footer bar – buttons anchored here so they don't 'float' */}
        <div className="modal-south">
          {/* Use form= to submit the form from outside the <form> node, like HW1 */}
          <input
            type="submit"
            form="edit-song-form"
            className="modal-button"
            value="Confirm"
          />
          <input
            type="button"
            className="modal-button"
            value="Cancel"
            onClick={onCancel}
          />
        </div>
      </div>
    </div>
  );
}
