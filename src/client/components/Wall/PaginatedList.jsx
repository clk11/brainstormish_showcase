import React, { useEffect } from 'react';
import { Box, Pagination } from '@mui/material';

const PaginatedList = ({ data, page, setPage }) => {
    const itemsPerPage = 4;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentPageData = data.slice(startIndex, endIndex);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div style={{ flex: '1 0 auto', overflowY: 'auto' }}>
                {currentPageData.map((post, index) => (
                    <div key={index} style={{ marginBottom: '16px' }}>
                        {post}
                    </div>
                ))}
            </div>
            <Box mt={2} display="flex" justifyContent="center" style={{ flexShrink: 0 }}>
                <Pagination
                    count={Math.ceil(data.length / itemsPerPage)}
                    page={page}
                    onChange={handleChangePage}
                />
            </Box>
        </div>
    );
}

export default PaginatedList;
