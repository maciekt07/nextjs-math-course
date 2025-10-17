"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDocumentInfo, useField, useFormFields } from "@payloadcms/ui";
import { GripVertical } from "lucide-react";
import type { NumberFieldClientComponent } from "payload";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Lesson } from "@/payload-types";

const SortableLesson: React.FC<{
  lesson: Lesson;
  index: number;
  isCurrentLesson: boolean;
}> = ({ lesson, index, isCurrentLesson }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 border-b border-border
        ${isDragging ? "opacity-60 bg-muted/50 z-10" : "bg-background"}
        ${isCurrentLesson ? "bg-blue-50/50 dark:bg-blue-950/30" : ""}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing min-w-0"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm truncate ${isCurrentLesson ? "font-medium text-blue-600 dark:text-blue-400" : "text-foreground"}`}
          >
            {lesson.title}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {lesson.slug}
          </div>
        </div>
      </div>
      {isCurrentLesson && (
        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 flex-shrink-0">
          Current
        </div>
      )}
    </div>
  );
};

const LessonReorderField: NumberFieldClientComponent = (props) => {
  const { path } = props;
  const { id: currentLessonId } = useDocumentInfo();
  const courseField = useFormFields(([fields]) => fields.course);
  const { setValue } = useField<number>({ path });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setActiveId] = useState<string | null>(null);

  const courseId = courseField?.value;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    const fetchLessons = async () => {
      if (!courseId) {
        setLessons([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/lessons?where[course][equals]=${courseId}&limit=100&sort=order`,
        );
        const data = await response.json();
        setLessons(data.docs || []);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);

    const newLessons = arrayMove(lessons, oldIndex, newIndex);
    setLessons(newLessons);

    const updates = newLessons.map((lesson, index) => ({
      id: lesson.id,
      order: index + 1,
    }));

    try {
      await Promise.all(
        updates.map((update) =>
          fetch(`/api/lessons/${update.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ order: update.order }),
          }),
        ),
      );

      const currentLessonNewOrder = updates.find(
        (u) => u.id === currentLessonId,
      )?.order;
      if (currentLessonNewOrder !== undefined) {
        setValue(currentLessonNewOrder);
      }
    } catch (error) {
      console.error("Error updating lesson order:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Lesson Order
        </label>
        <div className="p-3 text-sm text-muted-foreground bg-muted/50 rounded-lg border">
          Loading lessons...
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Lesson Order
        </label>
        <div className="p-3 text-sm text-muted-foreground bg-muted/50 rounded-lg border">
          Select a course to manage lesson order
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-2">
      <label>Order</label>
      <Accordion type="single" collapsible className="w-full bg-transparent">
        <AccordionItem value="lesson-reorder" className="border-none">
          <AccordionTrigger className="py-3 hover:no-underline px-3 bg-transparent border-1 border-gray-500">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">Lesson Order</span>
              <span className="text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            {lessons.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-lg border">
                No lessons found for this course
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-lg border bg-background">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext
                    items={lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {lessons.map((lesson, index) => (
                      <SortableLesson
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        isCurrentLesson={lesson.id === currentLessonId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LessonReorderField;
