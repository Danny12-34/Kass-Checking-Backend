// controllers/materialController.js
const supabase = require('../db');

// READ: Get all students with their material check records for a given term
exports.getStudentsWithMaterials = async (req, res) => {
    try {
        const { term } = req.query;
        const currentTerm = term || 'Term 1';

        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                material_checks(*)
            `)
            .eq('material_checks.term', currentTerm);

        if (error) throw error;

        // Clean up and normalize the structure so checked_by_name safely defaults to null
        const formattedData = data.map(student => {
            const materialChecks = student.material_checks || [];
            
            const processedChecks = materialChecks.map(check => ({
                ...check,
                checked_by_name: check.checked_by_name || null
            }));

            return {
                ...student,
                material_checks: processedChecks
            };
        });

        res.status(200).json(formattedData);
    } catch (err) {
        console.error('Get Students Error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Update or insert a specific material record row (present_material count)
exports.updateMaterialCheck = async (req, res) => {
    try {
        const { student_id, term, material_name, minimum, present_material, checked_by_name } = req.body;
        
        const checkerName = checked_by_name || 'Danny niyitanga';

        // Payload excludes 'checked_by' (which expects a UUID) to prevent type mismatch errors, 
        // relying strictly on 'checked_by_name' for the text string.
        const payload = {
            student_id,
            academic_year: '2026-2027',
            term: term || 'Term 1',
            material_name,
            minimum: Number(minimum) || 0,
            present_material: Number(present_material) || 0,
            checked_by_name: checkerName,
            checked_at: new Date(),
            updated_at: new Date()
        };

        const { data, error } = await supabase
            .from('material_checks')
            .upsert(payload, { onConflict: ['student_id', 'term', 'material_name'] })
            .select();

        if (error) {
            console.error('Supabase Upsert Detailed Error:', JSON.stringify(error, null, 2));
            return res.status(500).json({ error: error.message || 'Database upsert failed' });
        }
        
        return res.status(200).json({ message: 'Material updated successfully', data });
    } catch (err) {
        console.error('Server Catch Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};