import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Copy, ClipboardCheck, Check, Trash2 } from 'lucide-react';

// --- AddNoteModal Component ---
function AddNoteModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Close modal on escape key press
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave({
        title: title || "Untitled",
        content: content
      });
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Prompt</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Main App Component ---
export default function App() {
  // State is now managed locally. Data will not persist on refresh.
  const [notes, setNotes] = useState([
    { id: 1, title: "Space Hamster", content: "A cinematic shot of a hamster wearing a tiny space helmet, exploring a miniature Mars set made of red sand and pebbles." },
    { id: 2, title: "Coffee Logo", content: "Logo design for a sustainable coffee brand named 'Earthly Brews'. The logo should be minimalist, featuring a coffee bean and a leaf." },
    { id: 3, title: "Vegan Mousse Recipe", content: "Create a recipe for a vegan chocolate avocado mousse. The tone should be enthusiastic and easy to follow." },
    { id: 4, title: "Rainy Night Poem", content: "A short, rhyming poem about the quiet beauty of a rainy city night from the perspective of a cat watching from a window." },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Handlers to manage local state ---
  const addNote = (newNoteData) => {
    const newNote = {
      id: Date.now(),
      ...newNoteData,
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id, updatedData) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, ...updatedData } : note
    ));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  // --- Filtering Logic ---
  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, searchTerm]);

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-white p-4 sm:p-6 lg:p-8">
      <AddNoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addNote}
      />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider uppercase">
            Keep Prompt
          </h1>
        </header>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 shadow-lg"
            aria-label="Add new prompt"
          >
            <Plus size={28} />
          </button>
        </div>
        
        {/* --- Notes Grid --- */}
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={updateNote}
                onDelete={deleteNote}
              />
            ))
          ) : (
            <div className="text-center col-span-full py-16 text-gray-500">
              <p className="text-xl">No prompts found.</p>
              <p>Try a different search or add a new prompt!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- NoteCard Component ---
function NoteCard({ note, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = () => {
    const copyToClipboard = (text) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    };

    copyToClipboard(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      onUpdate(note.id, { title: editedTitle, content: editedContent });
    }
    setIsEditing(!isEditing);
    setConfirmDelete(false);
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(note.id);
    } else {
      setConfirmDelete(true);
    }
  };

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmDelete]);
  
  useEffect(() => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
  }, [note]);


  return (
    <div 
        className="bg-gray-800 rounded-2xl p-5 flex flex-col justify-between min-h-[16rem] shadow-md border border-gray-700 hover:border-blue-500 transition-all duration-300 group"
        onMouseLeave={() => setConfirmDelete(false)}
    >
      <div className="flex-grow flex flex-col overflow-hidden">
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="font-bold text-lg mb-2 bg-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        ) : (
          <h3 className="font-bold text-lg mb-2 truncate">{note.title}</h3>
        )}
        
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full flex-grow bg-gray-700 text-gray-300 resize-none focus:outline-none placeholder-gray-500 text-base rounded p-2"
            placeholder="Your prompt here..."
          />
        ) : (
          <p className="text-gray-400 text-base overflow-y-auto flex-grow">{note.content}</p>
        )}
      </div>

      <div className="flex justify-end items-center mt-4 space-x-3 pt-2 border-t border-gray-700/50">
        <button
          onClick={handleEditToggle}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label={isEditing ? "Save changes" : "Edit prompt"}
          disabled={confirmDelete}
        >
          {isEditing ? <Check size={20} className="text-green-400" /> : <Edit size={20} />}
        </button>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Copy prompt"
          disabled={isEditing || confirmDelete}
        >
          {copied ? <ClipboardCheck size={20} className="text-green-400" /> : <Copy size={20} />}
        </button>
        <button
          onClick={handleDeleteClick}
          className={`transition-colors disabled:opacity-50 ${confirmDelete ? 'text-red-500 hover:text-red-400' : 'text-gray-400 hover:text-white'}`}
          aria-label="Delete prompt"
          disabled={isEditing}
        >
          {confirmDelete ? <Check size={20} /> : <Trash2 size={20} />}
        </button>
      </div>
    </div>
  );
}