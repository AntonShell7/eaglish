import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { getVocabulary, MAIN_FOLDER, renameFolder, setFolderWords } from "@/lib/vocabularyStore";
import { writeFolderNames } from "@/lib/folderNames";

export function FolderEditor({ original, names, userId, onSaved, onCancel }: {
  original: string | null; names: string[]; userId: string;
  onSaved: (names: string[], name: string) => void; onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(original ?? "");
  const [words] = useState(getVocabulary);
  const [selected, setSelected] = useState(() => new Set(words.filter(w => w.folder === original).map(w => w.id)));
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const filtered = words.filter(w => `${w.word} ${w.translation}`.toLowerCase().includes(query.toLowerCase()));
  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = name.trim();
    if (!next || next.length > 80 || next === MAIN_FOLDER) { setError(t("vocabulary.setEditor.invalid")); return; }
    if (names.some(n => n !== original && n.toLocaleLowerCase() === next.toLocaleLowerCase())) {
      setError(t("vocabulary.setEditor.duplicate")); return;
    }
    const updated = [...new Set([...names.filter(n => n !== original && n !== MAIN_FOLDER), next])];
    try {
      writeFolderNames(userId, updated);
      if (original && original !== next) renameFolder(original, next);
      setFolderWords(next, [...selected]);
      onSaved(updated, next);
    } catch { setError(t("vocabulary.setEditor.saveError")); }
  };
  return (
    <form className="folder-editor card" onSubmit={save} aria-label={t(original ? "vocabulary.setEditor.edit" : "vocabulary.setEditor.create")}>
      <h2 className="text-lg font-bold">{t(original ? "vocabulary.setEditor.edit" : "vocabulary.setEditor.create")}</h2>
      <label className="folder-editor__label">
        {t("vocabulary.setEditor.name")}
        <input className="field" autoFocus maxLength={80} value={name} onChange={e => {setName(e.target.value); setError("");}} required />
      </label>
      <p className="folder-editor__hint">{t("vocabulary.setEditor.moveHint")}</p>
      <input className="field" type="search" aria-label={t("vocabulary.searchPlaceholder")} placeholder={t("vocabulary.searchPlaceholder")} value={query} onChange={e => setQuery(e.target.value)} />
      <div className="folder-editor__words">
        {filtered.map(word => (
          <label key={word.id} className="folder-editor__word">
            <input type="checkbox" checked={selected.has(word.id)} onChange={e => setSelected(current => {
              const next = new Set(current); if (e.target.checked) next.add(word.id); else next.delete(word.id); return next;
            })} />
            <span><strong>{word.word}</strong><small>{word.translation}</small></span>
            {word.folder && <span className="folder-editor__origin">{word.folder}</span>}
          </label>
        ))}
        {filtered.length === 0 && <p className="folder-editor__hint">{t(words.length ? "vocabulary.noMatches" : "vocabulary.setEditor.empty")}</p>}
      </div>
      {error && <p role="alert" className="folder-editor__error">{error}</p>}
      <div className="folder-editor__actions">
        <span>{t("vocabulary.setEditor.selected", { count: selected.size })}</span>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>{t("common.cancel")}</button>
        <button className="btn btn--primary" type="submit" disabled={!name.trim()}>{t("vocabulary.setEditor.save")}</button>
      </div>
    </form>
  );
}
