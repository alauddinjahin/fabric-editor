interface ArtBoradStyles {
    common: {
      width: string;
      height: string;
    };
    canvas: {
      position: string | any;
      top: number | string;
      left: number | string;
      zIndex: number;
    };
    parent: {
        position: string | any;
        top: number | string;
        left: number | string;
        width: string;
        height: string;
        background: string;
        backgroundSize: string;
        backgroundPosition?: string;
        filter: string;
        zIndex?: number;
      };
  }
  
  const ArtBoradStyles: ArtBoradStyles = {
    common: {
      width: "600px",  
      height: "600px", 
    },
    canvas: {
      position: 'absolute', 
      top: 0,              
      left: 0,             
      zIndex: 10,          
    },
    parent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'url(green-bg.jpg)',
        backgroundSize: 'conver',
        filter: 'blur(50px)', 
        zIndex: -1, 
    }
  };
  
  export default ArtBoradStyles;
  