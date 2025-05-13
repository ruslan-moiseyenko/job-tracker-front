import { type FC } from "react";

interface ErrorPageProps {
  status?: string;
  title?: string;
  message?: string;
  stack?: string;
}

export const ErrorPage: FC<ErrorPageProps> = ({
  status = "Error",
  title = "Oops!",
  message = "Something went wrong.",
  stack
}) => {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-3xl font-bold">{status}</h1>
      <p className="text-lg">{title}</p>
      <p className="text-sm text-gray-600 mt-4">{message}</p>
      {stack && (
        <pre className="w-full mt-6 p-4 overflow-x-auto bg-gray-100 border rounded">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
};
