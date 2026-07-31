import { useEffect, useMemo, useState } from "react";
import { Clock, GraduationCap, MapPin } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const DAYS = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
const HOURS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

interface HorarioBlock {
  id: string;
  materia: string;
  codigo: string;
  docente: string;
  aula: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
}

function parseHorario(horario: unknown): { dia: string; horaInicio: string; horaFin: string }[] {
  if (!horario) return [];
  const arr = Array.isArray(horario) ? horario : [horario];
  return arr
    .map((h) => (typeof h === "object" && h ? h as Record<string, unknown> : {}))
    .filter((h) => h.dia && h.hora_inicio && h.hora_fin)
    .map((h) => ({
      dia: String(h.dia).toUpperCase(),
      horaInicio: String(h.hora_inicio),
      horaFin: String(h.hora_fin),
    }));
}

export function HorarioPage() {
  const { perfil } = useAuth();
  const [blocks, setBlocks] = useState<HorarioBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!perfil) return;
    const perfilActual = perfil;

    let cancelled = false;

    async function cargarHorario() {
      setLoading(true);

      try {
        const rol = perfilActual.rol;

        const [ofertas, inscripciones] = await Promise.all([
          api.ofertas.list(),
          api.inscripciones.list(),
        ]);

        let list: any[] = [];

        if (rol === "ESTUDIANTE") {
          const estId = perfilActual.estudiante?.id;

          const ofertaIds = inscripciones
            .filter(
              (i: any) =>
                i.estudianteId === estId &&
                i.estado === "ACTIVA"
            )
            .map((i: any) => i.ofertaId);

          list = ofertas.filter((o: any) =>
            ofertaIds.includes(o.id)
          );

        } else if (rol === "DOCENTE") {
          const docId = perfilActual.docente?.id;

          list = ofertas.filter(
            (o: any) => o.docenteId === docId
          );

        } else if (
          rol === "ADMIN" ||
          rol === "COORDINADOR"
        ) {
          list = ofertas;
        }

        const parsed: HorarioBlock[] = [];

        for (const o of list) {
          const slots = parseHorario(o.horario);

          for (const slot of slots) {
            parsed.push({
              id: `${o.id}-${slot.dia}-${slot.horaInicio}`,
              materia: o.materia?.nombre ?? "",
              codigo: o.materia?.codigo ?? "",
              docente: o.docente?.perfil
                ? `${o.docente.perfil.nombre} ${o.docente.perfil.apellido}`
                : "",
              aula:
                o.aula?.nombre ??
                (o.modalidad === "VIRTUAL" ? "Virtual" : ""),
              dia: slot.dia,
              horaInicio: slot.horaInicio,
              horaFin: slot.horaFin,
              modalidad: o.modalidad ?? "",
            });
          }
        }

        if (!cancelled) {
          setBlocks(parsed);
        }

      } catch (error) {
        console.error("Error cargando horario:", error);

        if (!cancelled) {
          setBlocks([]);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarHorario();

    return () => {
      cancelled = true;
    };
  }, [perfil]);

  const byDay = useMemo(() => {
    const map: Record<string, HorarioBlock[]> = {};
    for (const d of DAYS) map[d] = [];
    for (const b of blocks) {
      const day = DAYS.find((d) => d === b.dia) ?? b.dia;
      if (map[day]) map[day].push(b);
    }
    for (const d of DAYS) {
      map[d].sort((a, b) => toMinutes(a.horaInicio) - toMinutes(b.horaInicio));
    }
    return map;
  }, [blocks]);

return (
  <div className="space-y-6">

    <PageHeader
      title="Horario académico"
      description="Tus clases programadas del periodo actual"
    />


    {loading ? (

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({length:6}).map((_,i)=>(
          <div
            key={i}
            className="h-32 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>


    ) : blocks.length === 0 ? (

      <div className="
        flex
        flex-col
        items-center
        justify-center
        py-20
        text-center
      ">
        <Clock className="h-8 w-8 text-muted-foreground mb-3"/>

        <p className="font-medium">
          Sin horario asignado
        </p>

        <p className="text-sm text-muted-foreground">
          No tienes clases registradas.
        </p>

      </div>


    ) : (

      <div className="
        grid
        gap-5
        md:grid-cols-2
        xl:grid-cols-3
      ">


        {DAYS.map(day=>{

          const clases = byDay[day];

          if (!clases.length) return null;


          return (

            <section
              key={day}
              className="
                rounded-xl
                border
                bg-card
                overflow-hidden
              "
            >

              {/* Header día */}

              <div className="
                flex
                items-center
                justify-between
                px-4
                py-3
                border-b
                bg-muted/30
              ">

                <h3 className="
                  text-sm
                  font-semibold
                ">
                  {day}
                </h3>


                <Badge
                  variant="secondary"
                  className="text-[10px]"
                >
                  {clases.length}
                </Badge>

              </div>



              <div className="
                p-3
                space-y-3
              ">


                {clases.map(b=>(

                  <article
                    key={b.id}
                    className="
                      rounded-lg
                      border
                      p-3
                      hover:bg-muted/30
                      transition
                    "
                  >


                    {/* hora */}

                    <div className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-primary
                      font-medium
                    ">

                      <Clock className="h-3.5 w-3.5"/>

                      {b.horaInicio}
                      {" - "}
                      {b.horaFin}

                    </div>



                    {/* materia */}

                    <div className="mt-2">

                      <h4 className="
                        text-sm
                        font-semibold
                        leading-tight
                      ">
                        {b.materia}
                      </h4>


                      <span className="
                        text-xs
                        font-mono
                        text-muted-foreground
                      ">
                        {b.codigo}
                      </span>

                    </div>



                    {/* detalles */}

                    <div className="
                      mt-3
                      space-y-1.5
                      text-xs
                      text-muted-foreground
                    ">


                      {b.docente && (

                        <div className="
                          flex
                          items-center
                          gap-2
                        ">
                          <GraduationCap className="h-3.5 w-3.5"/>

                          {b.docente}

                        </div>

                      )}



                      {b.aula && (

                        <div className="
                          flex
                          items-center
                          gap-2
                        ">
                          <MapPin className="h-3.5 w-3.5"/>

                          {b.aula}

                        </div>

                      )}

                    </div>



                    <Badge
                      variant={
                        b.modalidad === "VIRTUAL"
                          ? "default"
                          : "secondary"
                      }
                      className="mt-3 text-[10px]"
                    >
                      {b.modalidad}
                    </Badge>


                  </article>

                ))}

              </div>


            </section>

          );

        })}


      </div>

    )}

  </div>
);
}