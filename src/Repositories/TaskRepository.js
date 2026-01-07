const supabase = require("../config/database");

class TaskRepository {
  async create(task) {
    const { userId, title, description, completed, priority, category, dueDate } = task;
    
    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        user_id: userId,
        title,
        description: description || "",
        completed: completed || false,
        priority: priority || "medium",
        category: category || "general",
        due_date: dueDate || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getById(id, userId) {
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("is_deleted", false);

    if (userId !== undefined && userId !== null) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  // Alias for getById to match service expectations
  async getByIdAndUser(id, userId) {
    return this.getById(id, userId);
  }

  async findByTitle(userId, title) {
    const trimmedTitle = title.trim();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .ilike("title", trimmedTitle)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAll(userId, filters = {}) {
    let query = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (filters.completed !== undefined) {
      query = query.eq("completed", filters.completed);
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters.dueDate) {
      query = query.eq("due_date", filters.dueDate);
    }

    const sortMapping = {
      createdAt: "created_at",
      updatedAt: "updated_at",
      dueDate: "due_date",
      title: "title",
      priority: "priority"
    };

    const sortParam = filters.sort || "createdAt";
    const sortColumn = sortMapping[sortParam] || "created_at";
    const order = filters.order || "desc";
    query = query.order(sortColumn, { ascending: order === "asc" });

    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async count(userId, filters = {}) {
    let query = supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (filters.completed !== undefined) {
      query = query.eq("completed", filters.completed);
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (filters.dueDate) {
      query = query.eq("due_date", filters.dueDate);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count;
  }

  async update(id, userId, task) {
    const { title, description, completed, priority, category, dueDate } = task;
    
    const { data, error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        completed,
        priority,
        category,
        due_date: dueDate
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id, userId) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }

  async restore(id, userId) {
    const { error } = await supabase
      .from("tasks")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }

  async getTrash(userId) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", true)
      .order("deleted_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async permanentDelete(id, userId) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }

  async bulkUpdate(taskIds, userId, updates) {
    if (!taskIds || taskIds.length === 0) {
      throw { status: 400, message: "taskIds array cannot be empty" };
    }

    const updateData = {};
    
    if (updates.completed !== undefined) {
      updateData.completed = updates.completed;
    }
    if (updates.priority) {
      updateData.priority = updates.priority;
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }

    if (Object.keys(updateData).length === 0) {
      throw { status: 400, message: "No valid fields to update" };
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .in("id", taskIds)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .select();

    if (error) {
      throw { status: 500, message: error.message || "Failed to update tasks" };
    }
    return data.length;
  }

  async bulkDelete(taskIds, userId) {
    if (!taskIds || taskIds.length === 0) {
      throw { status: 400, message: "taskIds array cannot be empty" };
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .in("id", taskIds)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .select();

    if (error) {
      throw { status: 500, message: error.message || "Failed to delete tasks" };
    }
    return data.length;
  }

  async getSharedTasks(userId) {
    const { data, error } = await supabase
      .from("task_sharing")
      .select(`
        *,
        tasks(*),
        owner:users!task_sharing_owner_id_fkey(email, name)
      `)
      .eq("shared_with_id", userId);

    if (error) throw error;
    return data.map(item => ({
      ...item.tasks,
      ownerEmail: item.owner.email,
      ownerName: item.owner.name,
      permission: item.permission
    }));
  }

  async getStatistics(userId) {
    const stats = {};

    // Total tasks
    const { count: total } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_deleted", false);
    stats.total = total;

    // Completed tasks
    const { count: completed } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)
      .eq("is_deleted", false);
    stats.completed = completed;

    stats.pending = stats.total - stats.completed;

    // Overdue tasks
    const { count: overdue } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", false)
      .eq("is_deleted", false)
      .lt("due_date", new Date().toISOString());
    stats.overdue = overdue;

    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    // By priority
    const { data: byPriority } = await supabase
      .from("tasks")
      .select("priority")
      .eq("user_id", userId)
      .eq("is_deleted", false);
    
    stats.byPriority = byPriority.reduce((acc, row) => {
      acc[row.priority] = (acc[row.priority] || 0) + 1;
      return acc;
    }, {});

    // By category
    const { data: byCategory } = await supabase
      .from("tasks")
      .select("category")
      .eq("user_id", userId)
      .eq("is_deleted", false);
    
    stats.byCategory = byCategory.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});

    return stats;
  }
}

module.exports = new TaskRepository();