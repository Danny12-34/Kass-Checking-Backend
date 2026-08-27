const supabase = require('../db');

// READ: Get all students with their material check records for a given term
exports.getStudentsWithMaterials = async (req, res) => {
    try {
        const { term } = req.query;
        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                material_checks(*)
            `)
            .eq('material_checks.term', term || 'Term 1');

        if (error) throw error;
        res.status(200).json(data);
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

        // Explicitly format payload to match table columns safely
        const payload = {
            student_id,
            academic_year: '2026-2027',
            term: term || 'Term 1',
            material_name,
            minimum: Number(minimum) || 0,
            present_material: Number(present_material) || 0,
            checked_by_name: checkerName,
            checked_by: checkerName,
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