const supabase = require('../db');
const xlsx = require('xlsx');

// READ: Get unique list of classes dynamically from the students table
exports.getClasses = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('class');

        if (error) throw error;

        // Extract unique, non-null class names and sort them alphabetically
        const uniqueClasses = [...new Set(data.map(item => item.class).filter(Boolean))].sort();
        
        res.status(200).json(uniqueClasses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE: Register single student manually
exports.addStudent = async (req, res) => {
    try {
        const { reg_number, full_name, class: studentClass } = req.body;
        const { data, error } = await supabase
            .from('students')
            .insert([{ reg_number, full_name, class: studentClass }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Student registered successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE (Bulk): Register students via Excel/CSV upload
exports.uploadStudentsExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload an Excel or CSV file' });
        }

        // Read the uploaded file buffer using xlsx
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet data to JSON rows
        const rows = xlsx.utils.sheet_to_json(sheet);

        let importedCount = 0;

        for (const row of rows) {
            // Map column names dynamically to handle variations like reg_number, Reg number, etc.
            const reg_number = row.reg_number || row['Reg number'] || row['Reg Number'];
            const full_name = row.full_name || row["Student's Name"] || row['full_name'];
            const studentClass = row.class || row['Class'];

            if (reg_number && full_name) {
                await supabase
                    .from('students')
                    .upsert([{ 
                        reg_number: String(reg_number).trim(), 
                        full_name: String(full_name).trim(), 
                        class: studentClass ? String(studentClass).trim() : 'Unassigned' 
                    }], { onConflict: 'reg_number' });
                
                importedCount++;
            }
        }

        res.status(200).json({ message: `Successfully processed and imported ${importedCount} students from Excel.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get all students list only
exports.getAllStudents = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('reg_number', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE: Delete single student record
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};