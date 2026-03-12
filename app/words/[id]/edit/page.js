import Link from "next/link";
import { getWord } from "../../../actions/words";
import EditForm from "./EditForm";

export default async function EditWord({ params }) {
  const { id } = await params;
  const { word, error } = await getWord(id);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-red-400">{error}</p>
        <Link href="/words" className="text-primary font-medium text-sm">
          Back to words
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <Link href={`/words/${word.id}`} className="text-sm text-text-secondary hover:text-primary transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Word</h1>
      </div>
      <EditForm word={word} />
    </div>
  );
}
