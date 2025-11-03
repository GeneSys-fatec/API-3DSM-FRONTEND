import React from "react";
import { Calendar, Views } from "react-big-calendar";
import moment from "moment";

interface CalendarioComponentProps {
  localizer: any;
  eventosFiltrados: any[];
  view: 'month' | 'week';
  setView: (view: 'month' | 'week') => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  eventStyleGetter: (event: any) => any;
  handleSelectEvent: (event: any, e: any) => void;
  handleSelectSlot: (slotInfo: { start: Date }) => void;
  isMobile: boolean;
  eventosFiltradosLength: number;
}

const CalendarioComponent: React.FC<CalendarioComponentProps> = ({
  localizer,
  eventosFiltrados,
  view,
  currentDate,
  setCurrentDate,
  eventStyleGetter,
  handleSelectEvent,
  handleSelectSlot,
  isMobile,
  eventosFiltradosLength
}) => (
  <Calendar
    localizer={localizer}
    events={eventosFiltrados}
    startAccessor="start"
    endAccessor="end"
    style={{ height: '100%' }}
    view={view}
    date={currentDate}
    onNavigate={setCurrentDate}
    views={[Views.MONTH, Views.WEEK]}
    eventPropGetter={eventStyleGetter}
    onSelectEvent={handleSelectEvent}
    onSelectSlot={handleSelectSlot}
    selectable={true}
    popup={true}
    popupOffset={5}
    step={1440}
    timeslots={1}
    showMultiDayTimes={false}
    dayPropGetter={() => ({})}
    messages={{
      next: 'Próximo',
      previous: 'Anterior',
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      agenda: 'Agenda',
      noEventsInRange: 'Não há tarefas neste período',
      showMore: (total) => `+${total} mais`,
      date: 'Data',
      time: 'Horário',
      event: 'Evento',
      allDay: 'Dia inteiro',
      work_week: 'Semana de trabalho',
      yesterday: 'Ontem',
      tomorrow: 'Amanhã'
    }}
    formats={{
      timeGutterFormat: () => '',
      eventTimeRangeFormat: () => '',
      dayFormat: 'DD',
      dayHeaderFormat: (date) => moment(date).format('dddd, DD/MM'),
      dayRangeHeaderFormat: ({ start, end }) =>
        moment(start).format('DD [de] MMMM YYYY') + ' - ' + moment(end).format('DD [de] MMMM YYYY'),
      monthHeaderFormat: (date) => moment(date).format('MMMM YYYY'),
      weekdayFormat: (date) =>
        isMobile
          ? moment(date).format('ddd')
          : moment(date).format('dddd')
    }}
    components={{
      toolbar: (props) => (
        <div className="flex flex-col gap-3 mb-4 pb-3 border-b sm:flex-row sm:justify-between sm:items-center sm:gap-0">
          <div className="flex gap-2 justify-center sm:justify-start order-2 sm:order-1">
            <button
              onClick={() => props.onNavigate('PREV')}
              className="px-2 py-1 bg-white-100 hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 sm:px-3"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={() => props.onNavigate('TODAY')}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded text-blue-700 font-medium text-xs sm:text-sm"
            >
              Hoje
            </button>
            <button
              onClick={() => props.onNavigate('NEXT')}
              className="px-2 py-1 bg-white-100 hover:bg-gray-200 active:bg-gray-300 rounded text-gray-700 sm:px-3"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 relative w-full order-1 sm:order-2">
            <h2 className="text-lg font-bold text-gray-800 text-center sm:text-xl">
              {moment(props.date).format(view === 'month' ? 'MMMM YYYY' : 'DD [de] MMMM YYYY')}
            </h2>
          </div>
          <div className="text-xs text-gray-600 text-center order-3 sm:text-sm">
            <span className="hidden sm:inline">
              {eventosFiltradosLength} tarefa{eventosFiltradosLength !== 1 ? 's' : ''}
            </span>
            <span className="sm:hidden">
              {eventosFiltradosLength}
            </span>
          </div>
        </div>
      ),
      week: {
        header: ({ date }) => (
          <div className="text-center py-1 font-medium text-xs sm:py-2 sm:text-sm">
            {isMobile
              ? moment(date).format('ddd')
              : moment(date).format('dddd DD')}
          </div>
        )
      },
      timeGutterHeader: () => null
    }}
  />
);

export default CalendarioComponent;