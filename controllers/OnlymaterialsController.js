const supabase = require('../db');

// ==================== MATERIALS CRUD ====================

// CREATE: Add a new material (material, minimum)
exports.createMaterial = async (req, res) => {
    try {
        const { material, minimum } = req.body;

        const { data, error } = await supabase
            .from('materials')
            .insert([{ material, minimum }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Material created successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get all materials
exports.getAllMaterials = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('materials')
            .select('*');

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ: Get a single material by ID
exports.getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE: Update a material by ID
exports.updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { material, minimum } = req.body;

        const { data, error } = await supabase
            .from('materials')
            .update({ material, minimum })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Material updated successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE: Delete a material by ID
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('materials')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;
        res.status(200).json({ message: 'Material deleted successfully', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ==================== STUDENT MATERIAL CHECKS ====================

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