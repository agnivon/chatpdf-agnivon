import { ROUTES } from "@/constants/route.constans";
import { UserButton, auth } from "@clerk/nextjs";
import { ArrowRightIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import FileUpload from "../feature/FileUpload";
import { Button } from "../ui/button";
import ChangeKeyButton from "../feature/ChangeKeyButton";

export default async function HomePage() {
  const { userId } = await auth();

  const isAuthenticated = !!userId;

  return (
    <div className="w-full min-h-screen">
      <div className="fixed top-5 right-5 flex gap-3 items-center">
        <ChangeKeyButton />
        <UserButton afterSignOutUrl={ROUTES.HOME} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
          </div>
          <div className="my-4">
            {isAuthenticated && (
              <Link href={ROUTES.CHATS}>
                <Button className="text-base">
                  Go to Chats <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
          <p className="max-w-xl mt-1 text-lg text-foreground/60">
            Join millions of students, researchers and professionals to
            instantly answer questions and understand research with AI
          </p>
          <div className="w-full mt-6 flex flex-col items-center">
            {isAuthenticated ? (
              <FileUpload />
            ) : (
              <Link href={ROUTES.SIGN_IN}>
                <Button>
                  Login to Get Started <LogInIcon className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
