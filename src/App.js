import AddGM from './gmsheet/AddGM';
import React, { useState } from 'react';
import OpenGM from './gmsheet/OpenGM';
import AccountProjectSelector from './gmsheet/AccountProjectSelector';

function App() {

  const [open, setOpen] = useState(false);

  const [refreshlst, setRefreshlst] = useState(true);

  const [showCreateGMSheet, setShowCreateGMSheet] = useState("");

  const [accountId, setAccountId] = useState(0);
  const [projectId, setProjectId] = useState(0);
  const [selectedScreen, setselectedScreen] = useState("");
  const [sowId, SetsowId] = useState(0)
  const [accountdata, setaccountdata] = useState({

  })

  const handleOpenGM = screen => {
    if (screen == "Open" || screen == "Create") {
      setAccountId(0)
      setProjectId(0);
      SetsowId(0);
      setaccountdata({})
      setOpen(true)
    }

    setselectedScreen(screen);
    setShowCreateGMSheet(screen);
  }

  return (
    <>
      <div className='bg-blue-50 w-full text-black text-[20px] font-bold text-center p-4'>GM Sheet</div>
      <div className='flex justify-center items-center w-full  bg-blue-100 border-t-2 border-blue-900'>
        <div className='flex justify-center items-center px-28 py-5'>
          <button className={`p-3 mr-5 rounded-lg text-white border-r-2 ${showCreateGMSheet !== 'Create' ? 'bg-blue-600 hover:bg-blue-800' : 'bg-green-600 hover:bg-green-800'} `}
            onClick={() => handleOpenGM("Create")}>
            Create/Edit GM Sheet
          </button>
          <button className={`p-3 mr-5 rounded-lg text-white border-r-2 ${showCreateGMSheet !== 'Open' ? 'bg-blue-600 hover:bg-blue-800' : 'bg-green-600 hover:bg-green-800'} `}
            onClick={() => handleOpenGM("Open")}>
            Open/Edit Run Sheet
          </button>

        </div>
      </div>
      {showCreateGMSheet != "" && accountId > 0 &&

        <div className="bg-gray-100 py-8 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl w-[90%] shadow-md">
            {
              showCreateGMSheet === "Create" &&
              <AddGM setRefreshlst={setRefreshlst}
                screen={selectedScreen}
                accountdata={accountdata}
                appAccountId={accountId}
                appProjectId={projectId}
                appSowId={sowId}
              />
            }
            {
              showCreateGMSheet === "Open" &&
              <OpenGM refreshlst={refreshlst}
                projectId={projectId}
                accountId={accountId}
                sowId={sowId}
                accountdata={accountdata} />
            }
            {
              showCreateGMSheet === 'Edit' &&
              <AddGM setRefreshlst={setRefreshlst} projectId={projectId} accountId={accountId} screen={selectedScreen} />
            }
          </div>
        </div>
      }
      {open &&
      <AccountProjectSelector
        open={open}
        setOpen={setOpen}
        setShowCreateGMSheet={setShowCreateGMSheet}
        accountId={accountId}
        setAccountId={setAccountId}
        projectId={projectId}
        setProjectId={setProjectId}
        screen={selectedScreen}
        SetsowId={SetsowId}
        sowId={sowId}
        setaccountdata={setaccountdata}
      />}
    </>
  );
}

export default App;
