import { useState } from "react";
import { CalendarDays, Eye, Tag } from "lucide-react";
import { PageHeader } from "@/features/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  descripcion: string;
  contenido: string;
  imagen: string;
  altura: "short" | "medium" | "tall";
  autor: string;
}

const noticiasMock: Noticia[] = [
  {
    id: "n1",
    titulo: "Graduación de la Promoción 2026",
    categoria: "Eventos",
    fecha: "2026-07-20",
    descripcion: "La universidad celebra la graduación de más de 300 nuevos profesionales.",
    contenido:
      "Con la presencia de autoridades académicas, familiares y amigos, la universidad llevó a cabo la ceremonia de graduación de la Promoción 2026. Más de 300 estudiantes de las diferentes carreras recibieron su título profesional en un emotivo acto realizado en el auditorio central. El rector destacó el esfuerzo y dedicación de los graduados y los invitó a seguir representando a la institución con excelencia y compromiso social.",
    imagen: "https://picsum.photos/seed/graduacion/600/800",
    altura: "tall",
    autor: "Oficina de Comunicación",
  },
  {
    id: "n2",
    titulo: "Inauguración del nuevo laboratorio de robótica",
    categoria: "Investigación",
    fecha: "2026-07-15",
    descripcion: "Un espacio de última generación para la formación en ingeniería.",
    contenido:
      "La universidad inauguró su nuevo laboratorio de robótica e inteligencia artificial, equipado con brazos robóticos, simuladores y estaciones de desarrollo. Este espacio beneficiará a los estudiantes de Ingeniería en Sistemas y permitirá impulsar líneas de investigación en automatización industrial, visión por computadora y sistemas embebidos.",
    imagen: "https://picsum.photos/seed/laboratorio/600/400",
    altura: "short",
    autor: "Facultad de Ingeniería",
  },
  {
    id: "n3",
    titulo: "Convocatoria de becas al mérito académico",
    categoria: "Becas",
    fecha: "2026-07-10",
    descripcion: "Estudiantes con alto rendimiento podrán postular a becas completas.",
    contenido:
      "Se abre la convocatoria 2026-II de becas al mérito académico. Podrán postular todos los estudiantes que hayan obtenido un promedio igual o superior a 90 puntos en el período anterior. Las becas cubren el 100% de la matrícula y arancel mensual. Las inscripciones estarán abiertas hasta el 31 de agosto a través del portal estudiantil.",
    imagen: "https://picsum.photos/seed/becas/600/600",
    altura: "medium",
    autor: "Dirección de Bienestar Estudiantil",
  },
  {
    id: "n4",
    titulo: "Feria de empleo y pasantías 2026",
    categoria: "Empleo",
    fecha: "2026-07-05",
    descripcion: "Más de 40 empresas participarán en la feria laboral anual.",
    contenido:
      "La universidad realizará la Feria de Empleo y Pasantías 2026, con la participación de más de 40 empresas nacionales e internacionales. Los estudiantes podrán postular a vacantes, participar en charlas sobre elaboración de CV y entrevistas simuladas, y conectar directamente con reclutadores de las principales empresas del país.",
    imagen: "https://picsum.photos/seed/feria/600/450",
    altura: "medium",
    autor: "Oficina de Vinculación Empresarial",
  },
  {
    id: "n5",
    titulo: "Estudiantes ganan concurso nacional de programación",
    categoria: "Logros",
    fecha: "2026-06-28",
    descripcion: "El equipo de la universidad obtuvo el primer lugar nacional.",
    contenido:
      "El equipo conformado por estudiantes de Ingeniería en Sistemas obtuvo el primer lugar en el Concurso Nacional de Programación 2026. Los jóvenes compitieron contra más de 80 equipos de todo el país resolviendo complejos problemas algorítmicos en tiempo real. El logro posiciona a nuestra universidad como referente en la formación de talento tecnológico.",
    imagen: "https://picsum.photos/seed/premio/600/700",
    altura: "tall",
    autor: "Facultad de Ingeniería",
  },
  {
    id: "n6",
    titulo: "Conferencia magistral sobre cambio climático",
    categoria: "Académico",
    fecha: "2026-06-20",
    descripcion: "Expertos internacionales disertarán sobre sostenibilidad ambiental.",
    contenido:
      "En el marco del ciclo de conferencias internacionales, la universidad recibirá a reconocidos expertos en sostenibilidad y cambio climático. El evento abordará las estrategias de adaptación para la región y el rol de las universidades en la transición hacia modelos de desarrollo sostenible. La entrada es libre para toda la comunidad universitaria.",
    imagen: "https://picsum.photos/seed/clima/600/500",
    altura: "medium",
    autor: "Vicerrectoría Académica",
  },
  {
    id: "n7",
    titulo: "Renovación de la biblioteca central",
    categoria: "Institucional",
    fecha: "2026-06-12",
    descripcion: "Nuevos espacios de estudio y acceso a bases de datos internacionales.",
    contenido:
      "La biblioteca central reabre sus puertas tras un proceso de modernización. Se habilitaron nuevas salas de estudio grupal, áreas de lectura silenciosa y un centro de cómputo con acceso a bases de datos académicas internacionales. Además, se amplió el horario de atención de 7:00 a.m. a 10:00 p.m. para beneficio de toda la comunidad universitaria.",
    imagen: "https://picsum.photos/seed/biblioteca/600/800",
    altura: "tall",
    autor: "Dirección de Biblioteca",
  },
  {
    id: "n8",
    titulo: "Torneo deportivo interfacultades",
    categoria: "Deportes",
    fecha: "2026-06-05",
    descripcion: "Fútbol, básquet y voleibol en la jornada deportiva anual.",
    contenido:
      "Del 15 al 30 de julio se realizará el tradicional Torneo Deportivo Interfacultades en las disciplinas de fútbol, básquetbol y voleibol. Los equipos de cada facultad competirán por el título de campeón general. Las inscripciones están abiertas en la Dirección de Deportes y la premiación se realizará en la ceremonia de clausura del período.",
    imagen: "https://picsum.photos/seed/deporte/600/450",
    altura: "short",
    autor: "Dirección de Deportes",
  },
];

const alturaClase: Record<Noticia["altura"], string> = {
  short: "aspect-[4/3]",
  medium: "aspect-square",
  tall: "aspect-[3/4]",
};

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NoticiasPage() {
  const [selected, setSelected] = useState<Noticia | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticias Universitarias"
        description="Mantente informado sobre la vida académica e institucional"
      />

      <div className="columns-1 sm:columns-2 xl:columns-3 2xl:columns-4 gap-4 [&>*]:mb-4">
        {noticiasMock.map((noticia) => (
          <button
            key={noticia.id}
            onClick={() => setSelected(noticia)}
            className="group block w-full overflow-hidden rounded-xl border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className={`relative w-full overflow-hidden ${alturaClase[noticia.altura]}`}>
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="mb-1.5">
                  <Badge className="bg-white/20 text-white backdrop-blur-sm border-transparent">
                    {noticia.categoria}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug">
                  {noticia.titulo}
                </h3>
              </div>
            </div>
            <div className="p-3.5">
              <p className="text-xs text-muted-foreground line-clamp-2">{noticia.descripcion}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {formatFecha(noticia.fecha)}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="h-3 w-3" />
                  Ver detalles
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{selected.categoria}</Badge>
                </div>
                <DialogTitle>{selected.titulo}</DialogTitle>
                <DialogDescription>
                  {formatFecha(selected.fecha)} · Publicado por {selected.autor}
                </DialogDescription>
              </DialogHeader>

              <img
                src={selected.imagen}
                alt={selected.titulo}
                className="w-full rounded-xl object-cover aspect-[16/9]"
              />

              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">{selected.descripcion}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{selected.contenido}</p>
                <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  Fuente: Oficina de Prensa Universitaria
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
