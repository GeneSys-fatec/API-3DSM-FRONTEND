import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/pt-br";

moment.locale('pt-br');
moment.updateLocale('pt-br', {
  week: { dow: 1, doy: 4 },
  months: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthsShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  weekdays: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá']
});

export const getCorPorStatus = (status: string): string => {
  const cores = {
    'PENDENTE': '#f59e0b',
    'EM DESENVOLVIMENTO': '#3b82f6',
    'CONCLUÍDA': '#10b981',
    'OUTROS': '#764b9c'
  } as const;
  const statusNormalizado = status.trim().toUpperCase();
  return cores[statusNormalizado as keyof typeof cores] || '#764b9c';
};

export const eventStyleGetter = (event: any) => {
  const cor = getCorPorStatus(event.resource?.status || event.status || '');
  return {
    style: {
      backgroundColor: cor,
      borderRadius: '6px',
      color: 'white',
      border: 'none',
      fontSize: '12px',
      fontWeight: 'bold' as const,
      padding: '0 6px',
      height: '28px',
      lineHeight: 'normal',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      textAlign: 'center' as const,
      width: '100%',
      margin: '0',
      boxSizing: 'border-box' as const
    }
  };
};

export const localizer = momentLocalizer(moment);

