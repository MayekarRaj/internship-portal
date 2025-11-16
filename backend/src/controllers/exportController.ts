import { Request, Response } from 'express';
import { getCSVBuffer } from '../services/exportService';

// Export applications to CSV
export const exportApplications = async (req: Request, res: Response) => {
  try {
    const options = {
      internshipId: req.query.internship_id ? parseInt(req.query.internship_id as string) : undefined,
      status: req.query.status as string || undefined,
      dateFrom: req.query.date_from as string || undefined,
      dateTo: req.query.date_to as string || undefined,
      search: req.query.search as string || undefined,
    };

    const buffer = await getCSVBuffer(options);
    
    // Set headers for file download
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="applications-${timestamp}.csv"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications'
    });
  }
};

