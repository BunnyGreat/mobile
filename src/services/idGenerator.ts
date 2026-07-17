import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase/firebase";

interface GenerateReadableIdOptions {
  prefix: string;
  collectionName: string;
  fieldName?: string;
  dateString?: string;
  sequenceLength?: number;
}

export const generateReadableId = async ({
  prefix,
  collectionName,
  fieldName = "id",
  dateString,
  sequenceLength = 6,
}: GenerateReadableIdOptions): Promise<string> => {
  const targetDate = dateString ?? new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefixPattern = `${prefix}-${targetDate}-`;

  const snapshot = await getDocs(collection(db, collectionName));
  const existingIds = new Set<string>();
  let highestSequence = 0;

  snapshot.docs.forEach((doc) => {
    const value = (doc.data()[fieldName] as string | undefined) ?? "";
    existingIds.add(value);

    if (!value.startsWith(prefixPattern)) {
      return;
    }

    const sequencePart = value.slice(prefixPattern.length);
    const parsedSequence = Number.parseInt(sequencePart, 10);

    if (!Number.isNaN(parsedSequence) && parsedSequence > highestSequence) {
      highestSequence = parsedSequence;
    }
  });

  let nextSequence = highestSequence + 1;
  let candidateId = `${prefix}-${targetDate}-${nextSequence.toString().padStart(sequenceLength, "0")}`;

  while (existingIds.has(candidateId)) {
    nextSequence += 1;
    candidateId = `${prefix}-${targetDate}-${nextSequence.toString().padStart(sequenceLength, "0")}`;
  }

  return candidateId;
};
