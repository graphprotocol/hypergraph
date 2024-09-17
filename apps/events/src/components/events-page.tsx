import { CalendarDays, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useY } from "react-yjs";
import * as Yjs from "yjs";

type Props = {
  yDoc: Yjs.Doc;
};

export function EventsPage(props: Props) {
  const addEvent = () => {
    const yEvent = new Yjs.Map();
    const id = Math.random().toString();
    yEvent.set("id", id);
    yEvent.set("name", "New Event");
    yEvent.set("date", "2023-12-31");
    yEvent.set("location", "New York, NY");
    yEvent.set("description", "A new event");
    props.yDoc.getMap("events").set(id, yEvent);
  };

  const events = useY(props.yDoc.getMap("events"));

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <span className="sr-only">Acme Events</span>
          <CalendarDays className="h-6 w-6" />
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Home
          </a>
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            About
          </a>
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none mb-8">
              Upcoming Events
            </h1>
            <Button
              onClick={() => {
                addEvent();
              }}
            >
              Add Event
            </Button>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(events).map(([id, event]) => (
                <Card key={id}>
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-2">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {
                          // @ts-expect-error tinybase types issue
                          new Date(event.date).toLocaleDateString()
                        }
                      </div>
                      <div className="flex items-center mt-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        {event.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{event.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Register Now</Button>
                    <Button
                      onClick={() => {
                        props.yDoc.getMap("events").delete(id);
                      }}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2023 Acme Events. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
