import { Progress } from "@/components/ui/progress";
import { useI18nContext } from "@/i18n/i18n-react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkDoneCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { TiArrowBackOutline } from "react-icons/ti";
import { Button } from "./ui/button";

import "katex/dist/katex.min.css";
import renderMathInElement from "katex/contrib/auto-render";
import { Flashcard, updateFlashcard } from "@/lib/storage";
import { LuDices } from "react-icons/lu";
import { Link } from "@tanstack/react-router";
const MAX_NUMBER_OF_CARDS_SHOWN = 7;
const spring = {
  type: "spring",
  stiffness: 300,
  damping: 40,
  duration: 1.0,
};
function getStudyDate(d: Date) {
  return new Date(d.toDateString());
}

function getUTCDate(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function daysBetween(d1: Date, d2: Date) {
  const utc1 = getUTCDate(d1);
  const utc2 = getUTCDate(d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function getLocalScore(card: Flashcard, studyAhead = 0) {
  const now = new Date();
  const date = getStudyDate(new Date(card.scheduling.lastReview));
  const dayDiff = daysBetween(date, now) + studyAhead;
  const expScore = Math.min(
    Math.min(Math.pow(1.5, card.scheduling.score), 13 * 1.5) / (dayDiff * 1.5),
    card.scheduling.score,
  );
  // If last updated today
  if (dayDiff === 0 && card.scheduling.score >= 1.0) {
    return 1;
  }
  return expScore;
}

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Flashcard[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 6;
  const SCALE_FACTOR = scaleFactor || 0.04;

  function updateCurrentFlashcardScore(
    ease: EASE_OPTIONS,
    info: { card: Flashcard; localScore: number },
  ) {
    let newScore = info.localScore;
    const globalScoreBefore = info.card.scheduling.score;
    let newGlobalScore = globalScoreBefore;
    switch (ease) {
      case "AGAIN":
        newScore = -0.1;
        if (globalScoreBefore > 2) {
          newGlobalScore = globalScoreBefore / 4 - 1;
        } else {
          newGlobalScore = -2;
        }
        break;
      case "HARD":
        newScore += 0.3334;
        newGlobalScore += 0.3334;
        break;
      case "GOOD":
        newScore += 0.5;
        newGlobalScore += 0.5;
        break;
      case "EASY":
        newScore += 1;
        newGlobalScore += 1;
        break;
    }
    info.card.scheduling = { score: newGlobalScore, lastReview: Date.now() };
    info.localScore = newScore;
    updateFlashcard(info.card);
    const newCards = [...cards]
      .filter((c) => c.localScore < 1)
      .map((inner) => ({ inner, random: Math.random() }));
    newCards.sort((a, b) => a.random - b.random);
    if (newCards.length > 0 && newCards[0].inner.card.id === info.card.id) {
      newCards.push(newCards.shift()!);
    }
    setCards(newCards.map(({ inner }) => inner));
  }

  // TODO: Update scoring
  const [cards, setCards] = useState(
    items
      .map((card) => ({ card, localScore: getLocalScore(card) }))
      .filter(({ localScore }) => localScore < 1),
  );
  const [flipped, setFlipped] = useState(false);

  const totalNumberOfCards = useMemo(() => {
    return items
      .map((card) => ({ card, localScore: getLocalScore(card) }))
      .filter(({ localScore }) => localScore < 1).length;
  }, [items]);
  const { LL } = useI18nContext();

  const activeCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCards(
      items
        .map((card) => ({ card, localScore: getLocalScore(card) }))
        .filter(({ localScore }) => localScore < 1),
    );
  }, [items]);
  useEffect(() => {
    if (activeCardRef.current) {
      renderMathInElement(activeCardRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true },
        ],
      });
    }
  }, [cards]);
  return (
    <div className="w-full" ref={activeCardRef}>
      <h2 className="text-lg text-left mb-2">
        {cards.length === totalNumberOfCards
          ? LL.NUM_CARDS_SCHEDULED(totalNumberOfCards)
          : LL.OF_NUM_CARDS_DONE({
              numDone: totalNumberOfCards - cards.length,
              numTotal: totalNumberOfCards,
            })}
      </h2>
      <Progress value={100 * (1 - cards.length / totalNumberOfCards)} />
      <div className="relative h-64 sm:h-52 md:h-60 xl:h-[21rem] w-[25rem] mx-auto max-w-full sm:mx-auto sm:w-80md:w-96 xl:w-[32rem] mt-[4rem]">
        {cards.length === 0 && <div>{LL.STUDY.NO_CARDS()}</div>}
        {cards.map(({ card }, index) =>
          index > MAX_NUMBER_OF_CARDS_SHOWN ? null : (
            <motion.div
              key={card.id}
              className="absolute flex flex-col justify-between w-full h-full"
              style={{
                transformOrigin: "top center",
              }}
              animate={{
                top: index * -CARD_OFFSET,
                scale: 1 - index * SCALE_FACTOR,
                zIndex:
                  Math.min(cards.length, MAX_NUMBER_OF_CARDS_SHOWN) - index,
              }}
            >
              <motion.div
                className="cursor-pointer"
                onClick={
                  index === 0
                    ? () => {
                        if (flipped === true) {
                          setFlipped(false);
                        } else {
                          setFlipped(true);
                        }
                      }
                    : undefined
                }
                transition={spring}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  className="select-none h-full"
                  style={{
                    perspective: "1200px",
                    transformStyle: "preserve-3d",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <motion.div
                    className="border p-2 h-full overflow-auto text-left rounded-lg border-gray-300 dark:border-neutral-800 bg-gray-50 dark:bg-slate-950 shadow-xl"
                    animate={{ rotateY: flipped && index === 0 ? -180 : 0 }}
                    transition={spring}
                    style={{
                      width: "100%",
                      height: "100%",
                      zIndex: flipped && index === 0 ? 0 : 1,
                      backfaceVisibility: "hidden",
                      position: "absolute",
                    }}
                  >
                    {/* <h2 className="text-3xl font-semibold mb-1">
                      {LL.STUDY.QUESTION()}
                    </h2> */}
                    {typeof card.front === "string" && (
                      <div
                        className="pl-1 pt-1 editor-prose h-full"
                        dangerouslySetInnerHTML={{ __html: card.front }}
                      ></div>
                    )}
                    {typeof card.front !== "string" && (
                      <div className="pl-1 pt-1 max-h-full">{card.front}</div>
                    )}
                  </motion.div>
                  <motion.div
                    className="border flex flex-col p-2 h-full overflow-auto text-left rounded-lg border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 shadow-lg"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: flipped && index === 0 ? 0 : 180 }}
                    transition={spring}
                    style={{
                      width: "100%",
                      height: "100%",
                      zIndex: flipped ? 1 : 0,
                      backfaceVisibility: "hidden",
                      position: "absolute",
                    }}
                  >
                    {/* <h2 className="text-3xl font-semibold mb-1">
                      {LL.STUDY.ANSWER()}
                    </h2> */}
                    {typeof card.back === "string" && (
                      <div
                        className="pl-1 pt-1 editor-prose"
                        dangerouslySetInnerHTML={{ __html: card.back }}
                      ></div>
                    )}
                    {typeof card.back !== "string" && (
                      <div className="pl-1 pt-1">{card.back}</div>
                    )}
                    {card.pdfDocumentID && (
                      <Link
                        className="underline decoration-foreground/20 hover:decoration-foreground text-gray-800 dark:text-gray-200 mx-auto block mt-auto"
                        to="/collections/documents/$docID"
                        params={{ docID: card.pdfDocumentID }}
                        search={{ page: card.pdfPage }}
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        {LL.VIEW_PDF()}
                      </Link>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ),
        )}
      </div>
      {cards.length > 0 && (
        <AnswerBar
          show={flipped}
          onFlip={() => setFlipped((f) => !f)}
          onAnswer={(answer) => {
            updateCurrentFlashcardScore(answer, cards[0]);
            setFlipped(false);
          }}
        />
      )}
      <Button
        variant="outline"
        className="mt-2 flex mx-auto gap-x-1.5"
        onClick={() => {
          const newCards = [...cards]
            .filter((c) => c.localScore < 1)
            .map((inner) => ({ inner, random: Math.random() }));
          newCards.sort((a, b) => a.random - b.random);
          setCards(newCards.map(({ inner }) => inner));
          setFlipped(false);
        }}
      >
        {LL.SHUFFLE()} <LuDices size={18} />
      </Button>
    </div>
  );
};

type EASE_OPTIONS = "AGAIN" | "HARD" | "GOOD" | "EASY";

const ANSWER_OPTIONS = [
  {
    name: "AGAIN",
    color: "#ef4c4f",
    bg: "#fcddde",
    darkBg: "#311112",
    icon: TiArrowBackOutline,
  },
  {
    name: "HARD",
    color: "#f49953",
    bg: "#fdecdf",
    darkBg: "#322013",
    icon: IoTimeOutline,
  },
  {
    name: "GOOD",
    color: "#36ed88",
    bg: "#d9fce9",
    darkBg: "#0e301d",
    icon: IoCheckmarkCircleOutline,
  },
  {
    name: "EASY",
    color: "#31dd0b",
    bg: "#dffee0",
    darkBg: "#143214",
    icon: IoCheckmarkDoneCircleOutline,
  },
] as const;
type AnswerOption = (typeof ANSWER_OPTIONS)[number]["name"];
function AnswerBar(props: {
  show: boolean;
  onAnswer: (answer: AnswerOption) => unknown;
  onFlip: () => unknown;
}) {
  const [selected, setSelected] = useState<AnswerOption>();
  const { LL } = useI18nContext();
  return (
    <div className="h-[5rem] relative text-center">
      <motion.div
        className={clsx(
          "z-10 absolute w-full h-[5rem] pt-4 ",
          props.show && "pointer-events-none",
        )}
        initial={{ opacity: 0.0 }}
        animate={{ opacity: !props.show ? 1.0 : 0.0 }}
        exit={{ opacity: 0.0 }}
        transition={{ duration: props.show ? 0.1 : 0.5 }}
      >
        <Button
          size="lg"
          className="w-full max-w-sm h-[3.5rem]"
          onClick={() => {
            props.onFlip();
          }}
        >
          {LL.STUDY.SHOW_ANSWER()}
        </Button>
      </motion.div>
      <motion.div
        initial={false}
        className={clsx(
          "pt-4 flex justify-center gap-x-2 w-full h-[5rem]",
          !props.show && "pointer-events-none",
        )}
        animate={{ opacity: props.show || selected !== undefined ? 1 : 0.0 }}
        transition={{ duration: 0.1 }}
      >
        {ANSWER_OPTIONS.map((answerOption) => (
          <motion.button
            key={answerOption.name}
            className={clsx(
              "z-20 flex flex-col items-center w-[4.5rem] text-xs font-semibold p-2 rounded-lg border",
              "border-[var(--color-bg-hover)] dark:bg-[var(--color-bg-dark)] bg-[var(--color-bg)]",
              "hover:bg-[--color-bg-hover]",
            )}
            style={
              {
                "--color-bg": answerOption.bg,
                "--color-bg-dark": answerOption.darkBg,
                "--color-bg-hover": answerOption.color + "50",
                "--color": answerOption.color,
              } as React.CSSProperties
            }
            onAnimationComplete={() => {
              if (selected === answerOption.name) {
                setSelected(undefined);
              }
            }}
            transition={{ duration: 0.4 }}
            animate={
              selected === answerOption.name
                ? { scale: 1.15, y: -100 }
                : selected === undefined
                ? { scale: 1 }
                : { opacity: 0 }
            }
            onClick={() => {
              setSelected(answerOption.name);
              props.onAnswer(answerOption.name);
            }}
          >
            {answerOption.icon({
              size: 32,
              // Note: Those only work because they are also used above;
              // Otherwise tailwind would not pick them up
              className: "text-[var(--color-bg-dark)] dark:text-[var(--color)]",
            })}
            {LL.STUDY.ANSWER_OPTIONS[answerOption.name]()}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
