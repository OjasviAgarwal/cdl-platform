import { AppBar } from "@mui/material";
import { useEffect, useState } from "react";

//flows that we need to take care
//1. plus button onlick in header.js calls handleClickOpenNewSubTitleDialog function here
//2. we need to pass newSubTitle value from submissiondialog.js to header.js
//3. we need to pass selected_community value and selectedCommunity value for their set functions to header.js
//4. userCommunities value needs to be passed from header.js to here
//5. 

export default function SubmissionDialog() {
    const [openNewSubTitleDialog, setOpenNewSubTitleDialog] = useState(false);
    const [newSubTitle, setNewSubTitle] = useState("");
    const [openSubmission, setOpenSubmission] = useState(false);

    const handleClickOpenNewSubTitleDialog = () => {
        setOpenNewSubTitleDialog(true);
    };

    const handleSelectCommunity = async (event) => {
        setCommunity(event.target.value);
        setSelectedCommunity(event.target.value);
    };

    const handleClickSubmission = () => {
        setOpenSubmission(true);
    };

    const handleCancelNewSubTitleDialog = () => {
        setNewSubTitle("")
        setOpenNewSubTitleDialog(false)
      }
    
    const handleNewSubmissionRequest = async (event) => {
        if (newSubTitle == "") {
            setSeverity("error");
            setMessage("Title cannot be empty!");
            handleClick();
            return;
        }

        if (selectedCommunity == "") {
            setSeverity("error");
            setMessage("Select a community and try again");
            handleClick();
            return;
        }
        var DATA = {
            community: selectedCommunity,
            source_url: "",
            title: newSubTitle,
            description: "",
            anonymous: true,
        }

        var URL = BASE_URL_CLIENT + GET_SUBMISSION_ENDPOINT
        var METH = "POST"

        const res = await fetch(URL, {
            method: METH,
            body: JSON.stringify(DATA),
            headers: new Headers({
                Authorization: jsCookie.get("token"),
                "Content-Type": "application/json",
            }),
        });

        const response = await res.json();
        if (res.status == 200) {
            setSubmissionProps({ submissionMode: "edit" });
            setCommunity("");
            setSelectedCommunity("");
            handleCancelNewSubTitleDialog();
            // Open a new tab
            window.open(WEBSITE_URL + 'submissions/' + response.submission_id, '_blank');
        }
    }

    const handleCloseSubmission = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        // This closes the submission modal.
        setOpenSubmission(false);
        // Resets all of the state variables for components inside the modal.
        setSubmitErrors(false);
        setBatchOption(false);
        setUploaded(false);
        setValidated(false);
        setSubmitBatch(false);
        setCommunity("");
      };

    return (
        <AppBar>
            <Dialog open={openNewSubTitleDialog} >
                <DialogTitle>
                    {" "}
                    Title for new Submission
                </DialogTitle>
                <DialogContent>
                    <Stack direction={'column'} textAlign={'center'} spacing={2}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="message"
                            name="message"
                            value={newSubTitle}
                            onChange={(event) => { setNewSubTitle(event.target.value) }}
                            label="Title*"
                            fullWidth
                            variant="standard"
                            error={newSubTitle.trim() === ''}
                            helperText={newSubTitle.trim() === '' ? 'Title is required' : ''}
                        />

                        <FormControl
                            sx={{ minWidth: 200, marginTop: "20px", maxHeight: 150 }}
                        >
                            <InputLabel id="demo-simple-select-label">
                                Select Community
                            </InputLabel>

                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{ backgroundColor: "white" }}
                                label="Select Community"
                                value={selectedCommunity}
                                onChange={(event) => handleSelectCommunity(event)}
                            >

                                {userCommunities && userCommunities.map(function (elem, index) {
                                    return (
                                        <MenuItem key={elem.community_id} value={elem.community_id}>
                                            {elem.name}
                                        </MenuItem>
                                    );
                                })}

                            </Select>
                        </FormControl>

                        <Typography variant="subtitle">
                            OR
                        </Typography>
                        <Button variant="outlined" onClick={handleClickSubmission}>Batch Upload</Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelNewSubTitleDialog}>Cancel</Button>
                    <Button onClick={handleNewSubmissionRequest}>Create</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openSubmission} onClose={handleCloseSubmission} fullWidth maxWidth="md">

                {/* {!batch ? (
             <SubmissionForm
               dialog_title="Create a New Submission"
               method="create"
               source_url=""
               title=""
               description=""
               submission_id=""
               communityNameMap={dropdowndata.community_info}
               handle_close={handleCloseSubmission}
             />
           ) :  */}
                (
                <div>
                    <DialogContent>
                        <h6 align="center">
                            Batch Upload - See Format Below
                        </h6>
                        <Button
                            sx={{ marginLeft: "auto" }}
                            onClick={() => {
                                navigator.clipboard.writeText(json_example);
                                setSeverity("success");
                                setMessage("Copied example to clipboard!");
                                handleClick();
                            }}
                        >
                            Copy Example
                        </Button>
                        <pre>{json_example}</pre>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <input
                                id="fileupload"
                                type="file"
                                onChange={() => {
                                    // File API related code. Grab input element, then send the
                                    // first file (we only allow singular uploads) to FileReader.
                                    var fileInput = document.getElementById("fileupload");
                                    let fileReader = new FileReader();
                                    fileReader.readAsText(fileInput.files[0]);
                                    fileReader.onloadend = function () {
                                        setSubmitErrors(false);
                                        setUploaded(false);
                                        setValidated(false);
                                        setSubmitBatch(false);
                                        // Try parsing file, make sure it is a JSON.
                                        try {
                                            // Save the JSON in a state variable to use in other functions
                                            setUploadJSON(JSON.parse(fileReader.result));
                                            setUploadStatus("success");
                                            setUploadStatusMessage("File is a valid JSON.");
                                            setUploaded(true);
                                        } catch {
                                            setUploadStatus("error");
                                            setUploadStatusMessage(
                                                "Could not parse the file. Please double check it is formatted correctly."
                                            );
                                            setUploaded(true);
                                            fileInput.value = null; // Clear value if upload was not successful
                                            setUploadJSON(null);
                                            return;
                                        }
                                    };
                                }}
                            ></input>

                        </div>
                        {has_uploaded ? (
                            <Alert sx={{ marginTop: "10px" }} severity={upload_status}>
                                {upload_status_message}
                            </Alert>
                        ) : null}
                        {has_validated ? (
                            <Alert
                                sx={{ marginTop: "10px" }}
                                severity={validate_status}
                            >
                                {validate_status_message}
                            </Alert>
                        ) : null}
                        {show_progress ? <LinearProgress /> : null}
                        {has_submit_batch ? (
                            <div>
                                <Alert
                                    sx={{ marginTop: "10px" }}
                                    severity={submit_batch_status}
                                >
                                    {submit_batch_message}
                                </Alert>
                                {view_submit_errors ? (
                                    <Button
                                        sx={{ margin: "5px" }}
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(foundIssues);
                                            setSeverity("success");
                                            setMessage("Copied error log to clipboard!");
                                            handleClick();
                                        }}
                                    >
                                        Copy Error Log
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                        <FormControl
                            sx={{ minWidth: 200, marginTop: "20px", maxHeight: 150 }}
                        >
                            <InputLabel id="demo-simple-select-label">
                                Select Community
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{ backgroundColor: "white" }}
                                label="Select Community"
                                value={selected_community}
                                onChange={handleSelectCommunity}
                            >
                                {dropdowndata.community_info &&
                                    dropdowndata.community_info.map(function (d, idx) {
                                        return (
                                            <MenuItem key={idx} value={d.community_id}>
                                                {d.name}
                                            </MenuItem>
                                        );
                                    })}
                            </Select>
                        </FormControl>
                        <DialogActions>
                            <Button onClick={handleCloseSubmission}>Cancel</Button>
                            <Button onClick={createNewBatchSubmission}>Submit</Button>
                        </DialogActions>
                    </DialogContent>

                </div>

                )

            </Dialog>
            <Dialog open={openSubmission} onClose={handleCloseSubmission} fullWidth maxWidth="md">

                {/* {!batch ? (
              <SubmissionForm
                dialog_title="Create a New Submission"
                method="create"
                source_url=""
                title=""
                description=""
                submission_id=""
                communityNameMap={dropdowndata.community_info}
                handle_close={handleCloseSubmission}
              />
            ) :  */}
                (
                <div>
                    <DialogContent>
                        <h6 align="center">
                            Batch Upload - See Format Below
                        </h6>
                        <Button
                            sx={{ marginLeft: "auto" }}
                            onClick={() => {
                                navigator.clipboard.writeText(json_example);
                                setSeverity("success");
                                setMessage("Copied example to clipboard!");
                                handleClick();
                            }}
                        >
                            Copy Example
                        </Button>
                        <pre>{json_example}</pre>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <input
                                id="fileupload"
                                type="file"
                                onChange={() => {
                                    // File API related code. Grab input element, then send the
                                    // first file (we only allow singular uploads) to FileReader.
                                    var fileInput = document.getElementById("fileupload");
                                    let fileReader = new FileReader();
                                    fileReader.readAsText(fileInput.files[0]);
                                    fileReader.onloadend = function () {
                                        setSubmitErrors(false);
                                        setUploaded(false);
                                        setValidated(false);
                                        setSubmitBatch(false);
                                        // Try parsing file, make sure it is a JSON.
                                        try {
                                            // Save the JSON in a state variable to use in other functions
                                            setUploadJSON(JSON.parse(fileReader.result));
                                            setUploadStatus("success");
                                            setUploadStatusMessage("File is a valid JSON.");
                                            setUploaded(true);
                                        } catch {
                                            setUploadStatus("error");
                                            setUploadStatusMessage(
                                                "Could not parse the file. Please double check it is formatted correctly."
                                            );
                                            setUploaded(true);
                                            fileInput.value = null; // Clear value if upload was not successful
                                            setUploadJSON(null);
                                            return;
                                        }
                                    };
                                }}
                            ></input>

                        </div>
                        {has_uploaded ? (
                            <Alert sx={{ marginTop: "10px" }} severity={upload_status}>
                                {upload_status_message}
                            </Alert>
                        ) : null}
                        {has_validated ? (
                            <Alert
                                sx={{ marginTop: "10px" }}
                                severity={validate_status}
                            >
                                {validate_status_message}
                            </Alert>
                        ) : null}
                        {show_progress ? <LinearProgress /> : null}
                        {has_submit_batch ? (
                            <div>
                                <Alert
                                    sx={{ marginTop: "10px" }}
                                    severity={submit_batch_status}
                                >
                                    {submit_batch_message}
                                </Alert>
                                {view_submit_errors ? (
                                    <Button
                                        sx={{ margin: "5px" }}
                                        size="small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(foundIssues);
                                            setSeverity("success");
                                            setMessage("Copied error log to clipboard!");
                                            handleClick();
                                        }}
                                    >
                                        Copy Error Log
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                        <FormControl
                            sx={{ minWidth: 200, marginTop: "20px", maxHeight: 150 }}
                        >
                            <InputLabel id="demo-simple-select-label">
                                Select Community
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                style={{ backgroundColor: "white" }}
                                label="Select Community"
                                value={selected_community}
                                onChange={handleSelectCommunity}
                            >
                                {dropdowndata.community_info &&
                                    dropdowndata.community_info.map(function (d, idx) {
                                        return (
                                            <MenuItem key={idx} value={d.community_id}>
                                                {d.name}
                                            </MenuItem>
                                        );
                                    })}
                            </Select>
                        </FormControl>
                        <DialogActions>
                            <Button onClick={handleCloseSubmission}>Cancel</Button>
                            <Button onClick={createNewBatchSubmission}>Submit</Button>
                        </DialogActions>
                    </DialogContent>

                </div>

                )

            </Dialog>
        </AppBar>
    );
}