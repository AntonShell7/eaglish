import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getStreak } from "@/lib/activityStore";
import { getVocabulary } from "@/lib/vocabularyStore";
import { buildSuggestions, type Suggestion } from "@/lib/suggestions";
import { IconFlame } from "@/components/brand/icons";
import "./home-offer.css";

/**
 * Home, for someone who came here because they felt like it.
 *
 * This screen has been two wrong things. First a catalogue — five equal doors,
 * a decision before any English. Then, briefly, a plan: step one, step two, ten
 * minutes, start now. The plan fixed the catalogue and replaced it with a
 * school, and nobody opens a school in the evening for fun.
 *
 * What is left is an offer. Two or three specific things, each shown with a
 * line of the actual English in it, so the choice is made by taste rather than
 * by category. Nothing is numbered, nothing is owed, and the page is perfectly
 * content if none of it is taken. That indifference is the point: pressure is
 * what makes an app something to avoid on a tired day, and a tired day is
 * exactly when a habit is won or lost.
 *
 * The choosing that remains is the good kind — between two things you can see —
 * rather than the kind that asks you to navigate a menu of abstractions.
 */
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [words, setWords] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    setWords(getVocabulary().length);
    void buildSuggestions().then(setSuggestions);
  }, []);

  const open = (item: Suggestion) => {
    if (item.kind === "review") return navigate("/vocabulary");
    const path = item.kind === "dictate" ? "/dictation" : "/reading";
    navigate(item.text ? `${path}?text=${encodeURIComponent(item.text.id)}` : path);
  };

  return (
    <div className="home">
      <header className="home__head">
        <h1 className="page-title home__h">{t("home.greeting")}</h1>
        <p className="home__sub">
          {words > 0 ? t("home.subWords", { count: words }) : t("home.subFirst")}
        </p>

        {streak > 0 && (
          <p className="home__streak">
            <IconFlame alive />
            {t("home.streak", { count: streak })}
          </p>
        )}
      </header>

      {suggestions === null ? (
        <div className="home__offers">
          <div className="skeleton home__skeleton" />
          <div className="skeleton home__skeleton" />
        </div>
      ) : (
        <div className="home__offers" data-stagger>
          {suggestions.map((item, i) => (
            <button key={i} type="button" className={`offer offer--${item.kind}`} onClick={() => open(item)}>
              <span className="offer__kind">{t(`home.offer.${item.kind}`)}</span>

              <span className="offer__title">
                {item.kind === "review" ? t("home.reviewTitle", { count: item.words?.length ?? 0 }) : item.text?.title}
              </span>

              {/* A line of the real English, so the offer can be judged before
                  it is accepted — the difference between a menu and a shelf you
                  can actually browse. */}
              {item.taste && <span className="offer__taste">{item.taste}</span>}

              {item.words && (
                <span className="offer__words">
                  {item.words.slice(0, 5).map((word) => (
                    <span key={word} className="chip">
                      {word}
                    </span>
                  ))}
                </span>
              )}

              {item.yours ? <span className="offer__meta">{t("home.yours", { count: item.yours })}</span> : null}
            </button>
          ))}
        </div>
      )}

      <nav className="home__more">
        <Link to="/reading">{t("nav.reading")}</Link>
        <Link to="/dictation">{t("nav.dictation")}</Link>
        <Link to="/everyday-english">{t("nav.everydayEnglish")}</Link>
        <Link to="/writing">{t("nav.writing")}</Link>
        <Link to="/vocabulary">{t("nav.vocabulary")}</Link>
      </nav>
    </div>
  );
}
