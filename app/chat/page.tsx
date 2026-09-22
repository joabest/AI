import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChatApp from "./ChatApp";

export default async function ChatPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <ChatApp userEmail={session.user.email ?? "Usuário"} />;
}
