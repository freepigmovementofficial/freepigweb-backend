export const getPagination = (page: number, limit: number) => {
    const take = limit;
    const skip = (page - 1) * limit;
    return { take, skip };
};

export const getPaginationMeta = (
    total: number,
    page: number,
    limit: number
) => {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    };
};