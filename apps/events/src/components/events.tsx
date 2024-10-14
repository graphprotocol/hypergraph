import React from "react";
import { useDeleteEntity, useQuery } from "../schema";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

export const Events: React.FC = () => {
  const events = useQuery({ types: ["Event"] });
  const deleteEntity = useDeleteEntity();

  console.log("Rendering Events", events);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        return (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>
                <Input
                  className="edit"
                  onChange={() => {
                    // changeDoc((doc) => {
                    //   doc.events[event.id].value = evt.target.value;
                    // });
                  }}
                  value={event.name}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>by {event.author.name}</p>
              <p>Participants:</p>
              <ul>
                {event.participants.map((participant) => (
                  <li key={participant.id}>
                    {participant.name} ({participant.badge.name})
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={(evt) => {
                  evt.preventDefault();
                  deleteEntity(event.id);
                }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
