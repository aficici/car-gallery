"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactNoteSchema, ContactNoteInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Phone, Mail, Users, FileText, Bell, Trash2, Plus } from "lucide-react";

type NoteType = "NOTE" | "CALL" | "EMAIL" | "MEETING" | "FOLLOW_UP";

interface ContactNote {
  id: string;
  type: NoteType;
  content: string;
  createdAt: string;
  user: { name: string; role: string };
}

interface ContactTimelineProps {
  customerId: string;
  initialNotes: ContactNote[];
  currentUserId: string;
  currentUserRole: string;
}

const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode; color: string }> = {
  NOTE: { label: "Note", icon: <FileText className="h-3 w-3" />, color: "bg-gray-100 text-gray-700" },
  CALL: { label: "Call", icon: <Phone className="h-3 w-3" />, color: "bg-blue-100 text-blue-700" },
  EMAIL: { label: "Email", icon: <Mail className="h-3 w-3" />, color: "bg-purple-100 text-purple-700" },
  MEETING: { label: "Meeting", icon: <Users className="h-3 w-3" />, color: "bg-green-100 text-green-700" },
  FOLLOW_UP: { label: "Follow-up", icon: <Bell className="h-3 w-3" />, color: "bg-orange-100 text-orange-700" },
};

export function ContactTimeline({ customerId, initialNotes, currentUserId, currentUserRole }: ContactTimelineProps) {
  const [notes, setNotes] = useState<ContactNote[]>(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<NoteType>("NOTE");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactNoteInput>({
    resolver: zodResolver(contactNoteSchema),
    defaultValues: { type: "NOTE" },
  });

  const onSubmit = async (data: ContactNoteInput) => {
    const res = await fetch(`/api/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: selectedType }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes([note, ...notes]);
      toast.success("Note added");
      reset();
      setShowForm(false);
    } else {
      toast.error("Failed to add note");
    }
  };

  const deleteNote = async (noteId: string) => {
    const res = await fetch(`/api/customers/${customerId}/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      setNotes(notes.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } else {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Contact History ({notes.length})
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as NoteType)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(noteTypeConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">{cfg.icon} {cfg.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Content <span className="text-red-500">*</span></Label>
            <Textarea
              {...register("content")}
              placeholder="What happened? What was discussed?"
              rows={3}
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No contact history yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const config = noteTypeConfig[note.type];
            const canDelete = note.user.name === currentUserId || currentUserRole === "ADMIN";
            return (
              <div key={note.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${config.color}`}>{config.icon}</div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className={`text-xs ${config.color} border-0 mr-2`}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {note.user.name} · {format(new Date(note.createdAt), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-foreground">{note.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
