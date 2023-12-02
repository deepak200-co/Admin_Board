import React, { useState, useEffect } from 'react';
import './Admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faArrowRight, faArrowLeftLong, faBackward, faForward, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';

const Admin = () => {
    const [members, setMembers] = useState([]);
    const [email, setEmail] = useState([]);
    const [role, setRole] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [editableRows, setEditableRows] = useState({});

    const itemsPerPage = 10;

    useEffect(() => {
        fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
            .then(response => response.json())
            .then(data => {
                setMembers(data);
                setEmail(data);
                setRole(data);
                setFilteredMembers(data);
            });
    }, []);

    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
        const filtered = members.filter(member =>
            Object.values(member).some(value =>
                String(value).toLowerCase().includes(searchValue.toLowerCase())
            )
        );
        setFilteredMembers(filtered);
        setCurrentPage(1);
    };

    const handlePagination = (page) => {
        setCurrentPage(page);
    };
    const generatePageNumbers = () => {
        const total_pages = Math.ceil(filteredMembers.length / itemsPerPage);
        return Array.from({ length: total_pages }, (_, index) => index + 1);
    };

    const handleSelectRow = (id) => {
        const isSelected = selectedRows.includes(id);
        if (isSelected) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };


    const handleSelectAll = () => {
        const currentRows = filteredMembers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        const allRowsSelected = selectedRows.length === currentRows.length;

        if (allRowsSelected) {
            setSelectedRows(selectedRows.filter(id => !currentRows.some(row => row.id === id)));
        } else {
            setSelectedRows([...selectedRows, ...currentRows.map(row => row.id)]);
        }
    };
    const handleEditField = (id) => {
        setEditableRows((prevState) => ({ ...prevState, [id]: true }));
    };

    const handleSave = (id) => {
        setEditableRows((prevState) => ({ ...prevState, [id]: false }));
    };

    const handleDelete = (id) => {
        const updatedMembers = members.filter(member => member.id !== id);
        setMembers(updatedMembers);
        setFilteredMembers(updatedMembers);
        setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    };
    const handleDeleteSelected = () => {
        if (selectedRows.length > 0) {
            const updatedMembers = members.filter(member => !selectedRows.includes(member.id));
            setMembers(updatedMembers);
            setFilteredMembers(updatedMembers);
            setSelectedRows([]);
        }
    };

    return (
        <div className="table-container">
            <div className='input-area'>
                <input
                    type="text"
                    id="search"
                    placeholder="Search"
                    className='search-icon'
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <button className="delete-selected" onClick={handleDeleteSelected} disabled={selectedRows.length === 0}>
                    <FontAwesomeIcon icon={faTrash} /> Delete Selected
                </button></div>
            <table className='members-table' id="members-table">
                <thead>
                    <tr>
                        <th>
                            Select All{' '}
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={selectedRows.length === filteredMembers.length}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>{filteredMembers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((member) => (
                        <tr
                            key={member.id}
                            className={`${selectedRows.includes(member.id) ? 'selected' : ''} ${editableRows[member.id] ? 'editable' : ''}`}
                        >
                            <td>
                                <input
                                    className='check'
                                    type="checkbox"
                                    checked={selectedRows.includes(member.id)}
                                    onChange={() => handleSelectRow(member.id)}
                                />
                            </td>
                            <td>{member.id}</td>
                            <td>{member.name}</td>
                            <td>{member.email} </td>
                            <td>{member.role}</td>
                            <td>

                                {editableRows[member.id] ? (
                                    <>
                                        <button className="save" onClick={() => handleSave(member.id)}>
                                            <FontAwesomeIcon icon={faSave}/> Save
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="edit" onClick={() => handleEditField(member.id)}>
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        <button className="delete" onClick={() => handleDelete(member.id)}>
                                            <FontAwesomeIcon icon={faTrash} />  Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">

                <button className='pagi' onClick={() => handlePagination(1)}>
                    <FontAwesomeIcon icon={faBackward} /> First</button>
                <button className='pagi' onClick={() => handlePagination(currentPage > 1 ? currentPage - 1 : 1)}>
                    <FontAwesomeIcon icon={faArrowLeftLong} /> Prev
                </button>
                {generatePageNumbers().map((page) => (
                    <button
                        key={page}
                        className={page === currentPage ? 'active' : ''}
                        onClick={() => handlePagination(page)}
                    >
                        {page}
                    </button>
                ))}
                <button className='pagi'
                    onClick={() =>
                        handlePagination(
                            currentPage < Math.ceil(filteredMembers.length / itemsPerPage)
                                ? currentPage + 1
                                : currentPage
                        )
                    }
                >
                    Next <FontAwesomeIcon icon={faArrowRight} />
                </button>
                <button className='pagi'
                    onClick={() =>
                        handlePagination(Math.ceil(filteredMembers.length / itemsPerPage))
                    }
                >
                    Last <FontAwesomeIcon icon={faForward} />
                </button>
            </div>


        </div>
    );
};

export default Admin;
