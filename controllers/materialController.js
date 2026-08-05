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
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Update or insert a specific material record row (present_material count)
exports.updateMaterialCheck = async (req, res) => {
    try {
        const { student_id, term, material_name, minimum, present_material } = req.body;
        
        const { data, error } = await supabase
            .from('material_checks')
            .upsert({
                student_id,
                academic_year: '2026-2027',
                term,
                material_name,
                minimum,
                present_material,
                updated_at: new Date()
            }, { onConflict: ['student_id', 'term', 'material_name'] })
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Material updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




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
        res.status(500).json({ error: err.message });
    }
};