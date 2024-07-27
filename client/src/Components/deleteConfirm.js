const DeleteConfirm = ({show, itemName,onConfirm,onCancel})=>{
    if (!show) return null;

    return (
        <div className="confirm-dialog">
            <div className="confirm-dialog-content">
                <p>Are you sure you want to delete this?</p>
                <div className="confirm-dialog-actions">
                    <button onClick={onCancel}>No</button>
                    <button onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
}
export default DeleteConfirm;