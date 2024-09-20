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
import { useAddRowCallback, useStore, useTable } from "tinybase/ui-react";
import * as Yjs from "yjs";

type Props = {
  yDoc: Yjs.Doc;
};

export function EventsPage(props: Props) {
  const addEvent = useAddRowCallback("events", () => ({
    name: "New Event",
    date: "2023-12-31",
    location: "New York, NY",
    description: "A new event",
  }));

  const store = useStore();

  const events = useTable("events");

  return (
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
                      store?.delRow("events", id);
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
  );
}
