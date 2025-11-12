import React, { useMemo } from 'react';
import { Student, AcademicGrades, StudentCalculatedGrades, EntryExitRecord } from '../types';
import { calculateStudentPeriodAverages } from '../services/gradeCalculator';
import { ArrowRightLeftIcon } from './icons';

interface StudentTableProps {
  students: Student[];
  onViewStudent: (student: Student) => void;
  academicGrades: AcademicGrades;
  calculatedStudentGrades: Record<string, StudentCalculatedGrades>;
  entryExitRecords: EntryExitRecord[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onViewStudent, academicGrades, calculatedStudentGrades, entryExitRecords }) => {
  
  const studentDataWithMetrics = useMemo(() => {
    return students.map(student => {
      // Rendimiento General
      const periodAverages = calculateStudentPeriodAverages(academicGrades[student.id], calculatedStudentGrades[student.id]);
      const validTrimesterAverages = [periodAverages.t1, periodAverages.t2, periodAverages.t3].filter(avg => avg !== null) as number[];
      const generalPerformance = validTrimesterAverages.length > 0
        ? validTrimesterAverages.reduce((a, b) => a + b, 0) / validTrimesterAverages.length
        : null;

      // Media de Servicios
      const serviceAverages = calculatedStudentGrades[student.id]?.serviceAverages;
      const validServiceAverages = serviceAverages ? [serviceAverages.t1, serviceAverages.t2, serviceAverages.t3].filter(avg => avg !== null) as number[] : [];
      const serviceMean = validServiceAverages.length > 0
        ? validServiceAverages.reduce((a, b) => a + b, 0) / validServiceAverages.length
        : null;

      // Incidencias Recientes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const hasRecentIncident = entryExitRecords.some(record => {
        if (record.studentId !== student.id) return false;
        const [day, month, year] = record.date.split('/');
        const recordDate = new Date(`${year}-${month}-${day}`);
        return recordDate >= sevenDaysAgo;
      });

      return {
        ...student,
        generalPerformance,
        serviceMean,
        hasRecentIncident
      };
    });
  }, [students, academicGrades, calculatedStudentGrades, entryExitRecords]);

  const getPerformanceColor = (grade: number | null) => {
    if (grade === null) return 'bg-gray-200 text-gray-700';
    if (grade >= 7) return 'bg-green-100 text-green-800';
    if (grade >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre Completo</th>
              <th scope="col" className="px-4 py-3 text-center">Rendimiento Gral.</th>
              <th scope="col" className="px-4 py-3 text-center">Media Servicios</th>
              <th scope="col" className="px-4 py-3 text-center">Incidencias</th>
              <th scope="col" className="px-4 py-3">NRE</th>
              <th scope="col" className="px-4 py-3">Grupo</th>
              <th scope="col" className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {studentDataWithMetrics.map(student => {
              const fullName = `${student.apellido1} ${student.apellido2}, ${student.nombre}`.trim();
              return (
                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        className="w-9 h-9 rounded-full object-cover mr-3" 
                        src={student.fotoUrl} 
                        alt={`Foto de ${fullName}`} 
                      />
                      {fullName}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(student.generalPerformance)}`}>
                        {student.generalPerformance?.toFixed(2) ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center font-medium">
                    {student.serviceMean?.toFixed(2) ?? '-'}
                  </td>
                   <td className="px-4 py-2 text-center">
                    {student.hasRecentIncident && (
                        <ArrowRightLeftIcon className="w-5 h-5 text-orange-500 mx-auto" title="Incidencia reciente" />
                    )}
                  </td>
                  <td className="px-4 py-2">{student.nre}</td>
                  <td className="px-4 py-2">{student.grupo}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <a href="#" onClick={(e) => { e.preventDefault(); onViewStudent(student); }} className="font-medium text-blue-600 hover:underline">Ver Ficha</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;